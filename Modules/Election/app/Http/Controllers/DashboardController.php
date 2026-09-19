<?php

namespace Modules\Election\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Models\Candidate;
use Modules\Election\Models\Election;
use Modules\Election\Models\Vote;
use Modules\Election\Repositories\CandidateRepository;

class DashboardController extends Controller
{
    public function __construct(
        SettingsService             $settingsService,
        private CandidateRepository $candidateRepository
    )
    {
        parent::__construct($settingsService);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $elections = Election::orderBy('date_start', 'desc')
            ->where('user_id', auth()->id())
            ->get();

        $electionId = $request->get('election');
        if ($electionId) {
            $selectedElection = $elections->firstWhere('id', $electionId) ?: $elections->first();
        } else {
            $selectedElection = $elections->first();
        }

        if ($selectedElection) {
            $totalVotes = Vote::whereHas('candidate', function ($q) use ($selectedElection) {
                $q->where('election_id', $selectedElection->id);
            })->whereStatus(VoteStatusEnum::Verified->name)->count();

            $suspiciousVotes = Vote::whereHas('candidate', function ($q) use ($selectedElection) {
                $q->where('election_id', $selectedElection->id);
            })->whereStatus(VoteStatusEnum::Suspicious->name)->count();

            $approvedCandidates = Candidate::where('election_id', $selectedElection->id)
                ->whereStatus(CandidateStatusEnum::Approved->name)->count();

            $pendingCandidates = Candidate::where('election_id', $selectedElection->id)
                ->whereStatus(CandidateStatusEnum::PendingReview->name)->count();

            $usersWithVotes = User::whereHas('votes', function ($q) use ($selectedElection) {
                $q->whereHas('candidate', function ($q2) use ($selectedElection) {
                    $q2->where('election_id', $selectedElection->id);
                });
            })->whereNotNull('shopify_user_id')->count();

            $conversion = $usersWithVotes > 0 ? $totalVotes * 100 / $usersWithVotes : 0;

            $topCandidates = Candidate::where('election_id', $selectedElection->id)
                ->withCount(['votes' => function ($q) {
                    $q->whereStatus(VoteStatusEnum::Verified->name);
                }])
                ->orderByDesc('votes_count')
                ->limit(50)
                ->get();
        } else {
            $totalVotes = 0;
            $suspiciousVotes = 0;
            $approvedCandidates = 0;
            $pendingCandidates = 0;
            $conversion = 0;
            $topCandidates = collect();
        }

        $categories = $this->candidateRepository->getCategoryList();

        return view('dashboard', compact(
            'elections',
            'selectedElection',
            'totalVotes',
            'suspiciousVotes',
            'approvedCandidates',
            'pendingCandidates',
            'conversion',
            'categories',
            'topCandidates'
        ));
    }

    /**
     * Get top candidates via API for AJAX loading
     */
    public function getTopCandidates(Request $request)
    {
        $electionId = $request->input('election_id');

        if (!$electionId) {
            return response()->json([
                'success' => false,
                'message' => 'Election ID is required',
                'data' => []
            ], 400);
        }

        $topCandidates = Candidate::where('election_id', $electionId)->whereStatus(CandidateStatusEnum::Approved->name)
            ->withCount(['votes' => function ($q) {
                $q->whereStatus(VoteStatusEnum::Verified->name);
            }])
            ->whereRelation('election', 'user_id', auth()->id())
            ->orderByDesc('votes_count')
            ->limit(50)
            ->get()
            ->map(function ($candidate, $index) {
                return [
                    'rank' => $index + 1,
                    'country' => config('election.countries.' . $candidate->country_code, $candidate->country_code),
                    'name' => $candidate->first_name . ' ' . $candidate->last_name,
                    'votes' => number_format($candidate->votes_count, 0, '.', ',')
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $topCandidates
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        abort(404);
    }
}
