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

    function getCategoryList(): \Illuminate\Database\Eloquent\Collection|array|\LaravelIdea\Helper\App\Models\_IH_Candidate_C
    {
        return $this->builder->whereNotNull('category')
            ->select('category')
            ->groupBy('category')
            ->get()->map(fn(Candidate $candidate) => $candidate->category)->toArray();
    }
}