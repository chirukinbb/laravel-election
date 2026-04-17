<?php

namespace App\Jobs;

use App\Enums\CandidateStatusEnum;
use App\Models\Election;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessFinishedElections implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $yesterday = now()->subDay()->toDateString();

        $finishedElections = Election::where('date_end', $yesterday)->get();

        if ($finishedElections->isEmpty()) {
            Log::info('No elections found that ended yesterday.');
            return;
        }

        foreach ($finishedElections as $election) {
            DB::transaction(function () use ($election) {
                $top50CandidateIds = $election->candidates()
                    ->where('status', CandidateStatusEnum::Approved->value)
                    ->withCount(['votes' => function ($query) {
                        $query->where('status', \App\Enums\VoteStatusEnum::Verified->value);
                    }])
                    ->orderByDesc('votes_count')
                    ->limit(50)
                    ->pluck('id');

                if ($top50CandidateIds->isEmpty()) {
                    Log::info("No approved candidates found for election: {$election->name} (ID: {$election->id})");
                    return;
                }

                $election->candidates()
                    ->whereIn('id', $top50CandidateIds)
                    ->update(['status' => CandidateStatusEnum::Top50->value]);

                Log::info("Updated top 50 candidates for election: {$election->name} (ID: {$election->id})");
            });

            Artisan::call('election:resume', ['election_id' => $election->id]);

            Log::info("Executed election:resume for election: {$election->name} (ID: {$election->id})");
        }
    }
}
