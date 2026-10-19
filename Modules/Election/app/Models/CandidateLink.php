<?php

namespace Modules\Election\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateLink extends Model
{
    protected $table = 'candidate_links';

    protected $fillable = [
        'candidate_id',
        'label',
        'url',
    ];

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function toFrontendArray(): array
    {
        return [
            'label' => (string)$this->label,
            'url' => (string)$this->url,
        ];
    }
}
