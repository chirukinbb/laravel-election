<?php

namespace Modules\Election\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CandidateContributionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'what' => $this->what,
            'when' => $this->when,
            'forWhom' => $this->for_whom,
        ];
    }
}
