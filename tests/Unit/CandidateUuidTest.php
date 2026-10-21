<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Models\Candidate;
use Modules\Election\Models\Election;
use Tests\TestCase;

class CandidateUuidTest extends TestCase
{
    use RefreshDatabase;

    public function test_candidate_generates_uuid_when_created(): void
    {
        $user = User::factory()->create();

        $election = Election::create([
            'user_id' => $user->id,
            'name' => 'Test Election',
            'date_start' => '2026-10-01',
            'date_end' => '2026-10-15',
        ]);

        $candidate = Candidate::create([
            'election_id' => $election->id,
            'first_name' => 'Test',
            'last_name' => 'Candidate',
            'country' => 'US',
            'city' => 'New York',
            'activity' => ['en' => 'Community action'],
            'reason' => 'Reason for nomination',
            'nominator_name' => 'Test Committee',
            'show_nominator' => true,
            'status' => CandidateStatusEnum::Approved->name,
            'proposed_by' => $user->id,
            'portrait_url' => 'https://example.com/portrait.jpg',
        ]);

        $this->assertNotNull($candidate->uuid);
        $this->assertMatchesRegularExpression('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $candidate->uuid);
    }
}
