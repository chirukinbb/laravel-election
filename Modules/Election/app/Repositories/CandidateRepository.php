<?php

namespace Modules\Election\Repositories;

use DB;
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

        // Подзапрос: голоса + место по всему голосованию
        $ranks = DB::table('candidates as c')
            ->leftJoin('votes as v', function ($join) {
                $join->on('v.candidate_id', '=', 'c.id')
                    ->where('v.status', VoteStatusEnum::Verified->name);
            })
            ->where('c.election_id', $electionId)
            ->where('c.status', CandidateStatusEnum::Approved->name)
            ->groupBy('c.id')
            ->selectRaw('c.id as candidate_id')
            ->selectRaw('COUNT(v.id) as votes_count')
            ->selectRaw('RANK() OVER (ORDER BY COUNT(v.id) DESC) as `rank`');

        $query = $this->builder
            ->joinSub($ranks, 'r', 'r.candidate_id', '=', 'candidates.id')
            ->select('candidates.*', 'r.votes_count', 'r.rank')
            ->when($country, fn(Builder $q, string $value) => $q->where('candidates.country', strtoupper($value)))
            ->when($search !== '', function (Builder $q) use ($search) {
                $term = "%{$search}%";

                $q->where(function (Builder $sub) use ($term) {
                    $sub->where('candidates.first_name', 'like', $term)
                        ->orWhere('candidates.last_name', 'like', $term)
                        ->orWhereRaw("CONCAT(candidates.first_name, ' ', candidates.last_name) LIKE ?", [$term]);
                });
            });

        match (strtolower($sort)) {
            'name' => $query->orderBy('candidates.first_name')->orderBy('candidates.last_name')->orderBy('candidates.id'),
            default => $query->orderBy('r.rank')->orderBy('candidates.id'),
        };

        return $query->with(['links', 'contributions'])->paginate($perPage);
    }

    private function escapeLike(string $value): string
    {
        return addcslashes($value, '%_\\');
    }
}