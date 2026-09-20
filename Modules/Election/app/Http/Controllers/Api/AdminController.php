<?php

namespace Modules\Election\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Enums\SettingKeyEnum;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Http\Requests\Api\ApproveCandidateRequest;
use Modules\Election\Http\Requests\Api\ApproveVoteRequest;
use Modules\Election\Http\Requests\Api\FlagVoteRequest;
use Modules\Election\Http\Requests\Api\MergeCandidatesRequest;
use Modules\Election\Http\Requests\Api\RejectCandidateRequest;
use Modules\Election\Http\Requests\Api\RejectVoteRequest;
use Modules\Election\Models\Candidate;
use Modules\Election\Models\Vote;
use Modules\Election\Services\AntiFraudService;

class AdminController extends Controller
{
    /**
     * Create AntiFraudService instance with current settings
     */
    private function createAntiFraudService(): AntiFraudService
    {
        return new AntiFraudService(
            ipWeight: (int)$this->settingsService->get(SettingKeyEnum::ScoreIP),
            fpWeight: (int)$this->settingsService->get(SettingKeyEnum::ScoreFP),
            ipFreqWeight: (int)$this->settingsService->get(SettingKeyEnum::RateLimitIP),
            fpFreqWeight: (int)$this->settingsService->get(SettingKeyEnum::RateLimitFP),
            approveLimit: (int)$this->settingsService->get(SettingKeyEnum::VoteApproveLimit),
            rejectLimit: (int)$this->settingsService->get(SettingKeyEnum::VoteRejectLimit)
        );
    }

    /**
     * Approve a candidate
     */
    public function approveCandidate(ApproveCandidateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $candidate = Candidate::find($validated['candidate_id']);

        if (!$candidate) {
            return response()->json([
                'success' => false,
                'message' => 'Candidate not found',
            ], 404);
        }

        $candidate->update([
            'status' => CandidateStatusEnum::Approved->name,
        ]);

        Vote::create([
            'candidate_id' => $candidate->id,
            'user_id' => $candidate->proposed_by,
            'status' => VoteStatusEnum::Verified->name,
            'ip_hash' => '$ipHash',
            'fingerprint_hash' => '$fingerprintHash',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Candidate approved successfully',
            'data' => [
                'candidate_id' => $candidate->id,
                'status' => $candidate->status,
            ],
        ]);
    }

    /**
     * Reject a candidate
     */
    public function rejectCandidate(RejectCandidateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $candidate = Candidate::find($validated['candidate_id']);

        if (!$candidate) {
            return response()->json([
                'success' => false,
                'message' => 'Candidate not found',
            ], 404);
        }

        $candidate->update([
            'status' => CandidateStatusEnum::Rejected->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Candidate rejected',
            'data' => [
                'candidate_id' => $candidate->id,
                'status' => $candidate->status,
            ],
        ]);
    }

    /**
     * Merge two candidates (source into target)
     */
    public function mergeCandidates(MergeCandidatesRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $sourceCandidate = Candidate::find($validated['source_candidate_id']);
        $targetCandidate = Candidate::find($validated['target_candidate_id']);

        if (!$sourceCandidate || !$targetCandidate) {
            return response()->json([
                'success' => false,
                'message' => 'One or both candidates not found',
            ], 404);
        }

        DB::beginTransaction();

        try {
            // Use the model's mergeInto method which handles events
            $sourceCandidate->mergeInto($targetCandidate);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Candidates merged successfully',
                'data' => [
                    'source_candidate_id' => $sourceCandidate->id,
                    'target_candidate_id' => $targetCandidate->id,
                    'source_status' => $sourceCandidate->status,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to merge candidates: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Flag a vote as suspicious
     */
    public function flagVote(FlagVoteRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $vote = Vote::find($validated['vote_id']);

        if (!$vote) {
            return response()->json([
                'success' => false,
                'message' => 'Vote not found',
            ], 404);
        }

        $vote->update([
            'status' => VoteStatusEnum::Suspicious->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vote flagged as suspicious',
            'data' => [
                'vote_id' => $vote->id,
                'status' => $vote->status,
            ],
        ]);
    }

    /**
     * Approve a vote
     */
    public function approveVote(ApproveVoteRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $vote = Vote::find($validated['vote_id']);

        if (!$vote) {
            return response()->json([
                'success' => false,
                'message' => 'Vote not found',
            ], 404);
        }

        $vote->update([
            'status' => VoteStatusEnum::Verified->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vote approved successfully',
            'data' => [
                'vote_id' => $vote->id,
                'status' => $vote->status,
            ],
        ]);
    }

    /**
     * Reject a vote
     */
    public function rejectVote(RejectVoteRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $vote = Vote::find($validated['vote_id']);

        if (!$vote) {
            return response()->json([
                'success' => false,
                'message' => 'Vote not found',
            ], 404);
        }

        $vote->update([
            'status' => VoteStatusEnum::Rejected->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vote rejected',
            'data' => [
                'vote_id' => $vote->id,
                'status' => $vote->status,
            ],
        ]);
    }

    /**
     * Get fraud analysis for a specific vote
     */
    public function getVoteFraudAnalysis(Request $request): JsonResponse
    {
        $request->validate([
            'vote_id' => 'required|exists:votes,id',
        ]);

        $vote = Vote::with(['user', 'candidate'])->find($request->vote_id);

        if (!$vote) {
            return response()->json([
                'success' => false,
                'message' => 'Vote not found',
            ], 404);
        }

        $antiFraudService = $this->createAntiFraudService();
        $analysis = $antiFraudService->getAnalysisReport($vote);

        return response()->json([
            'success' => true,
            'data' => $analysis,
        ]);
    }

    /**
     * Re-analyze fraud score for a specific vote
     */
    public function reanalyzeVoteFraud(Request $request): JsonResponse
    {
        $request->validate([
            'vote_id' => 'required|exists:votes,id',
        ]);

        $vote = Vote::find($request->vote_id);

        if (!$vote) {
            return response()->json([
                'success' => false,
                'message' => 'Vote not found',
            ], 404);
        }

        $antiFraudService = $this->createAntiFraudService();
        $vote = $antiFraudService->analyzeVote($vote);

        return response()->json([
            'success' => true,
            'message' => 'Fraud score recalculated',
            'data' => [
                'vote_id' => $vote->id,
                'anti_fraud_score' => $vote->anti_fraud_score,
                'status' => $vote->status,
            ],
        ]);
    }

    /**
     * Get suspicious votes statistics
     */
    public function getSuspiciousVotesStats(): JsonResponse
    {
        $antiFraudService = $this->createAntiFraudService();
        $stats = $antiFraudService->getSuspiciousVotesStats();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get list of suspicious votes with pagination
     */
    public function getSuspiciousVotes(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
            'min_score' => 'integer|min:0|max:100',
        ]);

        $perPage = $request->input('per_page', 20);
        $minScore = $request->input('min_score', 50);

        $suspiciousVotes = Vote::with(['user', 'candidate'])
            ->where('anti_fraud_score', '>=', $minScore)
            ->orderByDesc('anti_fraud_score')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $suspiciousVotes->map(function ($vote) {
                return [
                    'id' => $vote->id,
                    'user_id' => $vote->user_id,
                    'candidate_id' => $vote->candidate_id,
                    'candidate_name' => $vote->candidate ?
                        $vote->candidate->first_name . ' ' . $vote->candidate->last_name : null,
                    'status' => $vote->status,
                    'anti_fraud_score' => $vote->anti_fraud_score,
                    'ip_hash' => $vote->ip_hash,
                    'fingerprint_hash' => $vote->fingerprint_hash,
                    'created_at' => $vote->created_at,
                ];
            }),
            'pagination' => [
                'current_page' => $suspiciousVotes->currentPage(),
                'per_page' => $suspiciousVotes->perPage(),
                'total' => $suspiciousVotes->total(),
                'last_page' => $suspiciousVotes->lastPage(),
            ],
        ]);
    }

    function bindWithElection(Request $request): JsonResponse
    {
        $request->validate([
            'candidates' => 'required|array',
            'election_id' => 'required|numeric'
        ]);

        Candidate::whereIn('id', $request->post('candidates'))->each(function (Candidate $candidate) use ($request) {
            $candidate->update([
                'election_id' => $request->post('election_id'),
                'status' => CandidateStatusEnum::Approved->name,
            ]);
            Vote::create([
                'candidate_id' => $candidate->id,
                'user_id' => $candidate->proposed_by,
                'status' => VoteStatusEnum::Verified->name,
                'ip_hash' => '$ipHash',
                'fingerprint_hash' => '$fingerprintHash',
            ]);
        });

        return response()->json(true);
    }

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
}
