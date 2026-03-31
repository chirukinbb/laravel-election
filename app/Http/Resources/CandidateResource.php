<?php

namespace App\Http\Resources;

use App\Enums\VoteStatusEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Candidate */
class CandidateResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->first_name . ' ' . $this->last_name,
            'country' => config('election.countries.' . $this->country_code),
            'votes_count' => $this->votes->where('status', VoteStatusEnum::Verified->name)->count()
        ];
    }
}
