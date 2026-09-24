<?php

namespace Modules\Profile\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Profile\Models\Profile;

class ProfileResource extends JsonResource
{
    /**
     * @var Profile
     */
    public $resource;

    public function toArray($request): array
    {
        return [
            'name' => $this->resource?->name,
            'avatar_url' => $this->resource?->avatar_url,
            'languages' => $this->resource?->languages,
            'bio' => $this->resource?->bio,
        ];
    }
}
