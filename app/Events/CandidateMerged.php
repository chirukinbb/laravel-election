<?php

namespace App\Events;

use App\Models\Candidate;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CandidateMerged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sourceCandidate;
    public $targetCandidate;

    /**
     * Create a new event instance.
     */
    public function __construct(Candidate $sourceCandidate, Candidate $targetCandidate)
    {
        $this->sourceCandidate = $sourceCandidate->load(['election']);
        $this->targetCandidate = $targetCandidate->load(['election']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('admin'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'candidate.merged';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'source_candidate_id' => $this->sourceCandidate->id,
            'source_candidate_name' => $this->sourceCandidate->first_name . ' ' . $this->sourceCandidate->last_name,
            'target_candidate_id' => $this->targetCandidate->id,
            'target_candidate_name' => $this->targetCandidate->first_name . ' ' . $this->targetCandidate->last_name,
            'election_id' => $this->sourceCandidate->election_id,
            'election_name' => $this->sourceCandidate->election?->name,
            'status' => $this->sourceCandidate->status,
            'merged_at' => now()->toIso8601String(),
        ];
    }
}
