<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Candidate extends Model
{
    protected $fillable = [
        'election_id',
        'first_name',
        'last_name',
        'country_code',
        'city',
        'profession',
        'role',
        'website',
        'socials',
        'photo_url',
        'reason_for_nomination'
    ];

    protected $casts = [
        'socials' => 'array'
    ];

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }
}
