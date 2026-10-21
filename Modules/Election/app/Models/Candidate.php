<?php

namespace Modules\Election\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Events\CandidateApproved;
use Modules\Election\Events\CandidateMerged;
use Modules\Election\Events\CandidateRejected;
use Modules\Election\Events\UpdateCandidates;

class Candidate extends Model
{
    protected $fillable = [
        'uuid',
        'first_name',
        'last_name',
        'country',
        'city',
        'activity',
        'reason',
        'nominator_name',
        'show_nominator',
        'status',
        'proposed_by',
        'portrait_url'
    ];

    protected $casts = [
        'show_nominator' => 'boolean',
        'activity' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $candidate) {
            $candidate->uuid ??= (string)Str::uuid();
        });
    }

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

    public function contributions(): HasMany
    {
        return $this->hasMany(CandidateContribution::class);
    }

    public function links(): HasMany
    {
        return $this->hasMany(CandidateLink::class);
    }

    /**
     * @return array<int, array{what: string, when: string, forWhom: string}>
     */
    public function contributionItems(): array
    {
        return $this->contributions()->get()->map(fn(CandidateContribution $item) => $item->toFrontendArray())->all();
    }

    /**
     * @return array<int, array{label: string, url: string}>
     */
    public function linkItems(): array
    {
        return $this->links()->get()->map(fn(CandidateLink $item) => $item->toFrontendArray())->all();
    }
}
