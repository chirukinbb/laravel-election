<?php

namespace App\Http\Controllers\Api;

use App\Enums\CandidateStatusEnum;
use App\Enums\SettingKeyEnum;
use App\Enums\VoteStatusEnum;
use App\Events\CandidateApproved;
use App\Events\CandidateMerged;
use App\Events\CandidateRejected;
use App\Events\VoteApproved;
use App\Events\VoteFlagged;
use App\Events\VoteRejected;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ApproveCandidateRequest;
use App\Http\Requests\Api\ApproveVoteRequest;
use App\Http\Requests\Api\FlagVoteRequest;
use App\Http\Requests\Api\MergeCandidatesRequest;
use App\Http\Requests\Api\RejectCandidateRequest;
use App\Http\Requests\Api\RejectVoteRequest;
use App\Models\Candidate;
use App\Models\Vote;
use App\Services\AntiFraudService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        // Broadcast the candidate approval event
        event(new CandidateApproved($candidate));

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

        // Broadcast the candidate rejection event
        event(new CandidateRejected($candidate));

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
            // Transfer votes from source to target
            Vote::where('candidate_id', $sourceCandidate->id)
                ->update(['candidate_id' => $targetCandidate->id]);

            // Mark source candidate as merged
            $sourceCandidate->update([
                'status' => CandidateStatusEnum::Merged->name,
            ]);

            DB::commit();

            // Broadcast the candidate merge event
            event(new CandidateMerged($sourceCandidate, $targetCandidate));

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

        // Broadcast the vote flagged event
        event(new VoteFlagged($vote));

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

        // Broadcast the vote approval event
        broadcast(new VoteApproved($vote));

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

        // Broadcast the vote rejection event
        event(new VoteRejected($vote));

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
}
