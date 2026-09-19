<?php

namespace Modules\Election\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Events\VoteApproved;
use Modules\Election\Events\VoteFlagged;
use Modules\Election\Events\VoteRejected;

class Vote extends Model
{
    protected $fillable = [
        'candidate_id',
        'user_id',
        'status',
        'ip_hash',
        'fingerprint_hash',
        'anti_fraud_score'
    ];

    public static function boot()
    {
        parent::boot();

        static::created(function ($vote) {
            if ($vote->status === VoteStatusEnum::Verified->name)
                event(new VoteApproved($vote));
        });

        static::updated(function ($vote) {
            if ($vote->isDirty('status')) {
                match ($vote->status) {
                    VoteStatusEnum::Verified->name => event(new VoteApproved($vote)),
                    VoteStatusEnum::Suspicious->name => event(new VoteFlagged($vote)),
                    VoteStatusEnum::Rejected->name => event(new VoteRejected($vote)),
                    default => null,
                };

                if ($vote->status === VoteStatusEnum::Verified->name)
                    event(new VoteApproved($vote));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }
}
