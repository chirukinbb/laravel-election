<?php

namespace Modules\Election\Http\Middlewares;

use Closure;
use Illuminate\Http\Request;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Events\UpdateCandidates\Candidate;
use Symfony\Component\HttpFoundation\Response;

class CheckPendingCandidates
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // Check if user has any pending candidates (not approved, rejected, or merged)
            $pendingCandidates = Candidate::where('proposed_by', $user->id)
                ->whereIn('status', [
                    CandidateStatusEnum::Draft->name,
                    CandidateStatusEnum::PendingReview->name,
                ])
                ->exists();

            if ($pendingCandidates) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have pending candidate nominations. Please wait for them to be reviewed before submitting a new one.',
                ], 403);
            }
        }

        return $next($request);
    }
}
