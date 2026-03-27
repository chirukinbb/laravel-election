<?php

namespace App\Http\Controllers\Api;

use App\Enums\CandidateStatusEnum;
use App\Enums\VoteStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ApproveCandidateRequest;
use App\Http\Requests\Api\ApproveVoteRequest;
use App\Http\Requests\Api\FlagVoteRequest;
use App\Http\Requests\Api\MergeCandidatesRequest;
use App\Http\Requests\Api\RejectCandidateRequest;
use App\Http\Requests\Api\RejectVoteRequest;
use App\Models\Candidate;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
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
            // Transfer votes from source to target
            Vote::where('candidate_id', $sourceCandidate->id)
                ->update(['candidate_id' => $targetCandidate->id]);

            // Mark source candidate as merged
            $sourceCandidate->update([
                'status' => CandidateStatusEnum::Merged->name,
            ]);

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
}
