<?php

namespace Modules\Election\Repositories;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Models\Candidate;

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

    public function paginate(
        string|null $country = null,
        string      $sort = 'votes',
        int         $perPage = 15,
        string|null $search = null,
        int         $electionId = 1
    ): LengthAwarePaginator
    {
        $search = $this->escapeLike(trim((string)$search));

        $query = $this->builder
            ->where('status', CandidateStatusEnum::Approved->name)
            ->when($country, function (Builder $q, string $value) {
                $normalized = strtoupper($value);

                $q->where(function (Builder $sub) use ($normalized) {
                    $sub->where('country', $normalized);
                });
            })
            ->when($search !== '', function (Builder $q) use ($search) {
                $term = "%{$search}%";

                $q->where(function (Builder $sub) use ($term) {
                    $sub->where('first_name', 'like', $term)
                        ->orWhere('last_name', 'like', $term)
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$term]);
                });
            })
            ->withCount([
                'votes' => fn(Builder $q) => $q->where('status', VoteStatusEnum::Verified->name),
            ]);

        match (strtolower($sort)) {
            'name' => $query->orderBy('first_name')->orderBy('last_name')->orderBy('id'),
            default => $query->orderByDesc('votes_count')->orderBy('id'),
        };

        return $query->where('election_id', $electionId)->with(['links', 'contributions'])->paginate($perPage);
    }

    private function escapeLike(string $value): string
    {
        return addcslashes($value, '%_\\');
    }
}