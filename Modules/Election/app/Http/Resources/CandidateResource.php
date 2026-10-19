<?php

namespace Modules\Election\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Election\Models\Candidate;

class CandidateResource extends JsonResource
{
    /**
     * @var Candidate
     */
    public $resource;

    public function __construct($resource)
    {
        if ($resource instanceof Candidate) {
            $resource->load(['contributions', 'links'])
                ->loadCount('votes');
        }

        parent::__construct($resource);
    }

    /**
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'country' => $this->country,
            'city' => $this->city,
            'portraitUrl' => $this->portrait_url,
            'activity' => $this->activity,
            'reason' => $this->reason,
            'nominatorName' => $this->show_nominator ? $this->nominator_name : null,
            'showNominator' => (bool)$this->show_nominator,
            'contributions' => CandidateContributionResource::collection($this->contributions),
            'links' => CandidateLinkResource::collection($this->links),
            'votes' => $this->votes_count ?? 0,
        ];
    }
}
