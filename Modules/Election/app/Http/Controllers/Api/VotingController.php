<?php

namespace Modules\Election\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Enums\VoteStatusEnum\CandidateResource;
use Modules\Election\Events\UpdateCandidates\Candidate;
use Modules\Election\Http\Requests\Api\VerifyCaptchaRequest;
use Modules\Election\Models\Vote\VoteService;
use Modules\Election\Traits\AntiFraud\SuggestCandidateRequest;
use Modules\Election\Traits\AntiFraud\VoteRequest;

class VotingController extends Controller
{

    /**
     * Get list of approved candidates with pagination
     */
    public function candidates(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $electionId = $request->input('election_id');

        $candidates = Candidate::where('status', CandidateStatusEnum::Approved->name)
            ->where('election_id', $electionId)
            ->orderBy('created_at', 'desc')
            ->get();

        return CandidateResource::collection($candidates);
    }

    /**
     * Search candidates by name, country, city, or profession
     */
    public function searchCandidates(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $query = $request->input('query', '');
        $country = $request->input('country');
        $perPage = $request->input('per_page', 15);
        $perPage = min(max($perPage, 1), 100);

        $candidates = Candidate::with(['election'])
            ->where('status', CandidateStatusEnum::Approved->name);

        if ($query) {
            $candidates->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhere('city', 'like', "%{$query}%")
                    ->orWhere('profession', 'like', "%{$query}%");
            });
        }

        if ($country) {
            $candidates->where('country_code', $country);
        }

        $candidates->orderBy('created_at', 'desc');

        $results = $candidates->paginate($perPage);

        return CandidateResource::collection($results);
    }

    /**
     * Get single candidate by ID
     */
    public function candidate($id): JsonResponse
    {
        $candidate = Candidate::with(['election', 'votes'])
            ->where('status', CandidateStatusEnum::Approved->name)
            ->find($id);

        if (!$candidate) {
            return response()->json([
                'success' => false,
                'message' => 'Candidate not found',
            ], 404);
        }

        $voteCount = $candidate->votes()
            ->where('status', VoteStatusEnum::Verified->name)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                ...$candidate->toArray(),
                'verified_votes_count' => $voteCount,
            ],
        ]);
    }

    /**
     * Submit a vote for a candidate
     */
    public function vote(VoteRequest $request): JsonResponse
    {
        $voteService = new VoteService($this->settingsService);
        $voteService->create($request->get('candidate_id'), $request->user()->id, $request->get('election_id'),
            $request->ipHash(), $request->fingerprintHash()
        );

        return response()->json([
            'success' => true
        ], 201)->cookie('vote', $request->get('candidate_id'));
    }

    /**
     * Suggest a new candidate
     */
    public function suggestCandidate(SuggestCandidateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $candidate = Candidate::create([
            'election_id' => $validated['election_id'],
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'country_code' => $validated['country_code'],
            'city' => $validated['city'] ?? null,
            'profession' => $validated['profession'] ?? null,
            'role' => $validated['role'] ?? null,
            'website' => $validated['website'] ?? null,
            'socials' => $validated['socials'] ?? null,
            'photo_url' => $validated['photo_url'] ?? null,
            'reason_for_nomination' => $validated['reason_for_nomination'],
            'status' => CandidateStatusEnum::PendingReview->name,
            'category' => $validated['category'],
            'proposed_by' => $request->user()->id
        ]);

        $request->user()->update([
            'first_name' => $validated['my_first_name'],
            'last_name' => $validated['my_last_name'],
            'email' => $validated['email'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Candidate suggestion submitted for review',
            'data' => [
                'candidate_id' => $candidate->id,
                'status' => $candidate->status,
            ],
        ], 201);
    }

    /**
     * Verify captcha token
     */
    public function verifyCaptcha(VerifyCaptchaRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $captchaToken = $validated['captcha_token'];

        $isValid = $this->verifyCaptchaToken($captchaToken);

        return response()->json([
            'success' => true,
            'data' => [
                'valid' => $isValid,
            ],
        ]);
    }

    /**
     * Get top 50 candidates by verified votes
     */
    public function top50(): JsonResponse
    {
        $candidates = Candidate::with(['election'])
            ->where('status', CandidateStatusEnum::Approved->name)
            ->withCount(['votes' => function ($query) {
                $query->where('status', VoteStatusEnum::Verified->name);
            }])
            ->orderByDesc('votes_count')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $candidates->map(function ($candidate) {
                return [
                    ...$candidate->toArray(),
                    'verified_votes_count' => $candidate->votes_count,
                ];
            }),
        ]);
    }

    /**
     * Get list of countries
     */
    public function countries(): JsonResponse
    {
        $countries = config('election.countries');

        $formattedCountries = collect($countries)->map(function ($name, $code) {
            return [
                'code' => $code,
                'name' => $name,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $formattedCountries,
        ]);
    }

    /**
     * Verify reCAPTCHA token with Google
     */
    private function verifyCaptchaToken(string $token): bool
    {
        $secretKey = config('services.recaptcha.secret');

        if (empty($secretKey)) {
            // If no secret key configured, validate token format only
            return !empty($token) && strlen($token) > 10;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
            ]);

            $result = $response->json();

            return $result['success'] ?? false;
        } catch (\Exception $e) {
            return false;
        }
    }
}
