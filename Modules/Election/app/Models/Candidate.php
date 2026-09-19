<?php

namespace Modules\Election\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Events\CandidateApproved;
use Modules\Election\Events\CandidateMerged;
use Modules\Election\Events\CandidateRejected;
use Modules\Election\Events\UpdateCandidates;

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
        'reason_for_nomination',
        'status',
        'category',
        'proposed_by'
    ];

    protected $casts = [
        'socials' => 'array'
    ];

    public static function boot()
    {
        parent::boot();

        static::updated(function ($candidate) {
            if ($candidate->isDirty('status')) {
                match ($candidate->status) {
                    CandidateStatusEnum::Approved->name => event(new CandidateApproved($candidate)),
                    CandidateStatusEnum::Rejected->name => event(new CandidateRejected($candidate)),
                    default => null,
                };

                if ($candidate->election) {
                    event(new UpdateCandidates($candidate->election));
                }
            }
        });

        static::deleted(function ($candidate) {
            if ($candidate->election) {
                event(new UpdateCandidates($candidate->election));
            }
        });
    }

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    /**
     * Merge this candidate into another candidate
     */
    public function mergeInto(Candidate $targetCandidate): void
    {
        // Transfer votes from this candidate to target
        $this->votes()->update(['candidate_id' => $targetCandidate->id]);

        // Mark this candidate as merged
        $this->update(['status' => CandidateStatusEnum::Merged->name]);

        // Dispatch merge event
        event(new CandidateMerged($this, $targetCandidate));

        // Dispatch update candidates event
        if ($this->election) {
            event(new UpdateCandidates($this->election));
        }
    }

    public function proposedBy(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'proposed_by');
    }
}
