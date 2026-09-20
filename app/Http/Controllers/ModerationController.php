<?php

namespace App\Http\Controllers;

use App\Enums\CandidateStatusEnum;
use App\Enums\VoteStatusEnum;
use App\Models\Candidate;
use App\Models\Vote;

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