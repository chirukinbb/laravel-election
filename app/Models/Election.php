<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Election extends Model
{
    protected $fillable = [
        'name',
        'date_start',
        'date_end'
    ];

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }
}
