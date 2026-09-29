<?php

namespace Modules\Election\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Election\Models\Candidate;

class FullCandidateResource extends JsonResource
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
            'first_name' => $this->resource->first_name,
            'last_name' => $this->resource->last_name,
            'country' => $this->resource->country_code,
            'avatar' => $this->resource->photo_url,
            'portrait_index' => (int)$this->resource->position - 1,
            'activity' => $this->resource->role,
            'reason' => $this->resource->reason_for_nomination,
            'qualities' => $this->resource->profession,
            'contribution' => [
                'en' => 'He organises mixed-ability games, repairs shared equipment and invites older players to mentor new participants.',
                'ru' => 'Он организует игры для разных уровней подготовки, чинит общий инвентарь и приглашает опытных игроков поддерживать новичков.',
                'es' => 'Organiza juegos para distintos niveles, repara el material compartido e invita a jugadores experimentados a acompañar a los nuevos.',
            ],
        ];
    }
}
