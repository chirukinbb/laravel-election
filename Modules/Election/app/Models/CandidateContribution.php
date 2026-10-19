<?php

namespace Modules\Election\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateContribution extends Model
{
    protected $table = 'candidate_contributions';

    protected $fillable = [
        'candidate_id',
        'what',
        'when',
        'for_whom',
    ];

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function toFrontendArray(): array
    {
        return [
            'what' => (string)$this->what,
            'when' => (string)$this->when,
            'forWhom' => (string)$this->for_whom,
        ];
    }
}
