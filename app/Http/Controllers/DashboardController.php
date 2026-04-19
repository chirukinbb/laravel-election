<?php

namespace App\Http\Controllers;

use App\Enums\CandidateStatusEnum;
use App\Enums\VoteStatusEnum;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\GoogleApiKey;
use App\Models\GoogleCloudSetting;
use App\Models\GoogleProject;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
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

        return view('dashboard', compact(
            'elections',
            'selectedElection',
            'totalVotes',
            'suspiciousVotes',
            'approvedCandidates',
            'pendingCandidates',
            'conversion',
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
            ->where('user_id', auth()->id())
            ->withCount(['votes' => function ($q) {
                $q->whereStatus(VoteStatusEnum::Verified->name);
            }])
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
