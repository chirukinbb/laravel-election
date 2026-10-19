<?php

namespace Modules\Election\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CandidateLinkResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'label' => $this->label,
            'url' => $this->url,
        ];
    }
}
