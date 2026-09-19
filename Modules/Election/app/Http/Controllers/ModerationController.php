<?php

namespace Modules\Election\Http\Controllers;


use App\Http\Controllers\Controller;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Models\Candidate;
use Modules\Election\Models\Vote;

class ModerationController extends Controller
{
    public function index()
    {
        $candidates = Candidate::where('status', CandidateStatusEnum::PendingReview->name)
            ->whereRelation('election', 'user_id', auth()->id())
            ->get();

        $votes = Vote::where('status', '!=', VoteStatusEnum::Verified->name)
            ->whereRelation('candidate', fn($query) => $query->whereRelation('election', 'user_id', auth()->id()))
            ->get();

        return view('moderation', compact('candidates', 'votes'));
    }
}