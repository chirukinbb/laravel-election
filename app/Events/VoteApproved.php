<?php

namespace App\Events;

use App\Models\Vote;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VoteApproved implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $vote;

    /**
     * Create a new event instance.
     */
    public function __construct(Vote $vote)
    {
        $this->vote = $vote->load(['candidate', 'candidate.election', 'user']);
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
        return 'vote.approved';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'vote_id' => $this->vote->id,
            'candidate_id' => $this->vote->candidate_id,
            'candidate_name' => $this->vote->candidate ?
                $this->vote->candidate->first_name . ' ' . $this->vote->candidate->last_name : null,
            'election_name' => $this->vote->candidate?->election?->name,
            'user_id' => $this->vote->user_id,
            'status' => $this->vote->status,
            'anti_fraud_score' => $this->vote->anti_fraud_score,
            'created_at' => $this->vote->created_at?->toIso8601String(),
        ];
    }
}
