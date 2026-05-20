<?php

namespace App\Repositories;

use App\Enums\CandidateStatusEnum;
use App\Models\Candidate;
use Illuminate\Database\Eloquent\Builder;

class CandidateRepository
{
    private Builder $builder;

    public function __construct()
    {
        $this->builder = Candidate::query();
    }

    public function getMyModeratingCandidate(int $electionId, int $userId)
    {
        return $this->builder->where('status', CandidateStatusEnum::PendingReview->name)
            ->where('proposed_by', $userId)
            ->where('election_id', $electionId)
            ->first();
    }
}