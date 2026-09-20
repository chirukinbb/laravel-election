<?php

namespace Modules\Election\View\Components;

use App\Models\User;
use Illuminate\View\Component;
use Illuminate\View\View;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Models\Candidate;
use Modules\Election\Models\Election;
use Modules\Election\Models\Vote;
use Modules\Election\Repositories\CandidateRepository;

class DashboardWidgetsComponent extends Component
{
    private CandidateRepository $candidateRepository;

    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        $this->candidateRepository = app(CandidateRepository::class);
    }

    /**
     * Get the view/contents that represent the component.
     */
    public function render(): View|string
    {
        $elections = Election::orderBy('date_start', 'desc')
            ->where('user_id', auth()->id())
            ->get();

        $electionId = request('election');
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

        return view('election::components.dashboard.widgets', compact(
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
}
