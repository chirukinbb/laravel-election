<?php

namespace App\Repositories;

use App\Models\Election;
use App\Models\Vote;
use Illuminate\Database\Eloquent\Builder;

class ElectionRepository
{
    private Builder $election;

    public function __construct()
    {
        $this->election = Election::query();
    }

    function getOngoingElection(string $shop)
    {
        return $this->election->where('date_start', '<=', now())
            // ->whereRelation('user', 'name', $shop)
            ->where('date_end', '>=', now())
            ->first();
    }

    function getLastElection(string $shop)
    {
        return $this->election->where('date_end', '<', now())
            //   ->whereRelation('user', 'name', $shop)
            ->orderByDesc('date_end')
            ->first();
    }

    function getUserVote(Election $election, int $userId)
    {

        return Vote::where('user_id', $userId)
            ->whereHas('candidate', function ($query) use ($election) {
                $query->where('election_id', $election->id);
            })->first();
    }
}