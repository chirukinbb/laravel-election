<?php

namespace Modules\Election\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Events\UpdateCandidates\Candidate;

/** @mixin Candidate */
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
            'votes_count' => $this->votes->where('status', VoteStatusEnum::Verified->name)->count(),
            'is_my' => $this->votes()->whereUserId(auth()->id())->whereStatus(VoteStatusEnum::Verified->name)->exists(),
            'shared_link' => env('PAGE_LINK') . '?vote_for=' . $this->id
        ];
    }
}
