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
        $candidates = Candidate::where('status', CandidateStatusEnum::PendingReview->name)->get();
        $votes = Vote::where('status', '!=', VoteStatusEnum::Verified->name)->get();

        return view('moderation', compact('candidates', 'votes'));
    }
}