<?php

namespace App\Events;

use App\Models\Candidate;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CandidateApproved implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $candidate;

    /**
     * Create a new event instance.
     */
    public function __construct(Candidate $candidate)
    {
        $this->candidate = $candidate->load(['election']);
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
        return 'candidate.approved';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'candidate_id' => $this->candidate->id,
            'candidate_name' => $this->candidate->first_name . ' ' . $this->candidate->last_name,
            'election_id' => $this->candidate->election_id,
            'election_name' => $this->candidate->election?->name,
            'status' => $this->candidate->status,
            'created_at' => $this->candidate->created_at?->toIso8601String(),
        ];
    }
}
