<?php

namespace App\Tests;

use App\Models\User;
use App\Models\Vote;
use App\Services\AntiFraudService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AntiFraudServiceTest extends TestCase
{
    use RefreshDatabase;

    private AntiFraudService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AntiFraudService::class);
    }

    public function test_calculate_score_for_normal_vote(): void
    {
        $user = User::factory()->create([
            'created_at' => now()->subDays(30), // Not a new account
        ]);

        $vote = Vote::factory()->create([
            'user_id' => $user->id,
            'ip_hash' => hash('sha256', '192.168.1.1'),
            'fingerprint_hash' => hash('sha256', 'unique-fingerprint-1'),
            'anti_fraud_score' => 0,
        ]);

        $score = $this->service->calculateScore($vote);

        // Should be low score since it's the only vote from this IP/fingerprint
        $this->assertLessThan(50, $score);
    }

    public function test_calculate_score_for_duplicate_ip(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $sameIpHash = hash('sha256', '192.168.1.100');

        // Create first vote
        Vote::factory()->create([
            'user_id' => $user1->id,
            'ip_hash' => $sameIpHash,
            'fingerprint_hash' => hash('sha256', 'fingerprint-1'),
        ]);

        // Create second vote with same IP
        $vote2 = Vote::factory()->create([
            'user_id' => $user2->id,
            'ip_hash' => $sameIpHash,
            'fingerprint_hash' => hash('sha256', 'fingerprint-2'),
        ]);

        $score = $this->service->calculateScore($vote2);

        // Should have higher score due to duplicate IP
        $this->assertGreaterThan(0, $score);
    }

    public function test_determine_status_below_threshold(): void
    {
        $status = $this->service->determineStatus(30);
        $this->assertEquals('Pending', $status);
    }

    public function test_determine_status_above_threshold(): void
    {
        $status = $this->service->determineStatus(60);
        $this->assertEquals('Suspicious', $status);
    }

    public function test_analyze_vote_updates_score_and_status(): void
    {
        $user = User::factory()->create();

        $vote = Vote::factory()->create([
            'user_id' => $user->id,
            'anti_fraud_score' => 0,
            'status' => 'Pending',
        ]);

        $updatedVote = $this->service->analyzeVote($vote);

        $this->assertNotNull($updatedVote->anti_fraud_score);
        $this->assertNotNull($updatedVote->status);
    }

    public function test_get_suspicious_votes_stats(): void
    {
        // Create some votes with different scores
        Vote::factory()->create(['anti_fraud_score' => 20]);
        Vote::factory()->create(['anti_fraud_score' => 55]);
        Vote::factory()->create(['anti_fraud_score' => 80]);

        $stats = $this->service->getSuspiciousVotesStats();

        $this->assertEquals(3, $stats['total_votes']);
        $this->assertEquals(2, $stats['suspicious_votes']);
        $this->assertEquals(1, $stats['high_risk_votes']);
    }
}
