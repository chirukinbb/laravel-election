<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Election extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'date_start',
        'date_end'
    ];

    protected $casts = [
        'date_start' => 'date',
        'date_end' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }

    /**
     * Check if the election is currently active (ongoing)
     */
    public function isOngoing(): bool
    {
        $today = Carbon::today();
        return $today->gte($this->date_start) && $today->lte($this->date_end);
    }

    /**
     * Check if the election has ended
     */
    public function isEnded(): bool
    {
        return Carbon::today()->gt($this->date_end);
    }

    /**
     * Check if the election is upcoming (not started yet)
     */
    public function isUpcoming(): bool
    {
        return Carbon::today()->lt($this->date_start);
    }

    /**
     * Get the current status of the election
     */
    public function getStatus(): string
    {
        if ($this->isOngoing()) {
            return 'ongoing';
        } elseif ($this->isEnded()) {
            return 'ended';
        } else {
            return 'upcoming';
        }
    }
}
