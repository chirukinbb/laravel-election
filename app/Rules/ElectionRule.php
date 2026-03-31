<?php

namespace App\Rules;

use App\Models\Election;
use App\Models\Vote;
use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ElectionRule implements ValidationRule
{
    public function __construct(private int $electionId)
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $election = Election::find($this->electionId);

        if (!$election) {
            $fail('Election not found.');
            return;
        }

        $now = Carbon::now();

        if ($now->lt($election->date_start)) {
            $fail('Voting has not started yet.');
            return;
        }

        if ($now->gt($election->date_end)) {
            $fail('Voting has already ended.');
            return;
        }

        $exists = Vote::where('user_id', auth()->id())
            ->whereHas('candidate', function ($query) {
                $query->where('election_id', $this->electionId);
            })
            ->exists();

        if ($exists) {
            $fail('You have already voted in this election.');
        }
    }
}