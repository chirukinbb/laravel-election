<?php

namespace Modules\Election\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Models\Candidate;

class ShortCandidateResource extends JsonResource
{
    /**
     * @var Candidate
     */
    public $resource;

    /**
     * @param Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->resource->id,
            'portraitIndex' => (int)$this->resource->position - 1,
            'first_name' => $this->resource->first_name,
            'last_name' => $this->resource->last_name,
            'country' => config('election.countries.' . $this->resource->country_code),
            'votes_count' => $this->resource->votes->where('status', VoteStatusEnum::Verified->name)->count(),
            'is_my' => $this->resource->votes()->whereUserId(auth()->id())->whereStatus(VoteStatusEnum::Verified->name)->exists(),
            'shared_link' => env('PAGE_LINK') . '?vote_for=' . $this->resource->id,
            'avatar' => $this->resource->photo_url,
        ];
    }
}
