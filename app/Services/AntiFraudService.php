<?php

namespace App\Services;

use App\Enums\VoteStatusEnum;
use App\Models\Vote;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class AntiFraudService
{
    private const MAX_FRAUD_SCORE = 100;

    public function __construct(
        private int $ipWeight = 20,
        private int $fpWeight = 25,
        private int $ipFreqWeight = 15,
        private int $fpFreqWeight = 15,
        private int $approveLimit = 5,
        private int $rejectLimit = 10
    )
    {
    }

    /**
     * Calculate anti-fraud score for a vote
     */
    public function calculateScore(array $voteData): int
    {
        $score = 0;

        // Check for duplicate IP addresses
        $score += $this->checkDuplicateIp($voteData);

        // Check for duplicate browser fingerprints
        $score += $this->checkDuplicateFingerprint($voteData);

        // Check voting frequency from same IP
        $score += $this->checkIpFrequency($voteData);

        // Check voting frequency from same fingerprint
        $score += $this->checkFingerprintFrequency($voteData);

        // Cap the score at maximum
        return min($score, self::MAX_FRAUD_SCORE);
    }

    /**
     * Check for votes from the same IP address
     */
    private function checkDuplicateIp(array $voteData): int
    {
        if (empty($voteData['ip_hash'])) {
            return 0;
        }

        $query = Vote::where('ip_hash', $voteData['ip_hash']);

        if (!empty($voteData['election_id'])) {
            $query->whereRelation('candidate', 'election_id', $voteData['election_id']);
        }

        $duplicateCount = $query->count();

        return $this->ipWeight * $duplicateCount;
    }

    /**
     * Check for votes with the same browser fingerprint
     */
    private function checkDuplicateFingerprint(array $voteData): int
    {
        if (empty($voteData['fingerprint_hash'])) {
            return 0;
        }

        $duplicateCount = Vote::where('fingerprint_hash', $voteData['fingerprint_hash'])
            ->whereRelation('candidate', 'election_id', $voteData['election_id'])
            ->count();

        return $this->fpWeight * $duplicateCount;
    }

    /**
     * Check voting frequency from same IP
     */
    private function checkIpFrequency(array $voteData): int
    {
        if (empty($voteData['ip_hash'])) {
            return 0;
        }

        $windowStart = Carbon::now()->subHours(24);

        $ipVotesInWindow = Vote::where('ip_hash', $voteData['ip_hash'])
            ->where('created_at', '>=', $windowStart)
            ->count();

        if ($ipVotesInWindow > $this->rejectLimit) {
            return $this->ipFreqWeight * 2;
        } elseif ($ipVotesInWindow > $this->approveLimit) {
            return $this->ipFreqWeight;
        }

        return 0;
    }

    /**
     * Check voting frequency from same fingerprint
     */
    private function checkFingerprintFrequency(array $voteData): int
    {
        if (empty($voteData['fingerprint_hash'])) {
            return 0;
        }

        $windowStart = Carbon::now()->subHours(24);

        $fpVotesInWindow = Vote::where('fingerprint_hash', $voteData['fingerprint_hash'])
            ->where('created_at', '>=', $windowStart)
            ->count();

        if ($fpVotesInWindow > $this->rejectLimit) {
            return $this->fpFreqWeight * 2;
        } elseif ($fpVotesInWindow > $this->approveLimit) {
            return $this->fpFreqWeight;
        }

        return 0;
    }

    /**
     * Determine vote status based on fraud score
     */
    public function determineStatus(int $score): string
    {
        if ($score >= $this->rejectLimit) {
            return VoteStatusEnum::Rejected->name;
        }

        if ($score >= $this->approveLimit) {
            return VoteStatusEnum::Suspicious->name;
        }

        return VoteStatusEnum::Pending->name;
    }

    /**
     * Analyze vote and return data with fraud score and status
     */
    public function analyzeVote(array $voteData): array
    {
        $score = $this->calculateScore($voteData);
        $status = $this->determineStatus($score);
        Log::channel('fraud')->info('Vote [' . $status . '] for election #' . $voteData['election_id'] . '(score ' . $score . ')');

        return array_merge($voteData, [
            'anti_fraud_score' => $score,
            'status' => $status,
        ]);
    }

    /**
     * Get detailed analysis report for a vote
     */
    public function getAnalysisReport(Vote $vote): array
    {
        $windowStart = Carbon::now()->subHours(24);

        return [
            'vote_id' => $vote->id,
            'ip_hash' => $vote->ip_hash,
            'fingerprint_hash' => $vote->fingerprint_hash,
            'duplicate_ip_votes' => Vote::where('ip_hash', $vote->ip_hash)
                ->where('id', '!=', $vote->id)
                ->count(),
            'duplicate_fingerprint_votes' => Vote::where('fingerprint_hash', $vote->fingerprint_hash)
                ->where('id', '!=', $vote->id)
                ->count(),
            'ip_votes_last_24h' => Vote::where('ip_hash', $vote->ip_hash)
                ->where('created_at', '>=', $windowStart)
                ->count(),
            'fp_votes_last_24h' => Vote::where('fingerprint_hash', $vote->fingerprint_hash)
                ->where('created_at', '>=', $windowStart)
                ->count(),
            'user_total_votes' => Vote::where('user_id', $vote->user_id)->count(),
            'account_age_days' => $vote->user ?
                Carbon::parse($vote->user->created_at)->diffInDays(Carbon::now()) : null,
            'fraud_score' => $this->calculateScore([
                'ip_hash' => $vote->ip_hash,
                'fingerprint_hash' => $vote->fingerprint_hash,
                'user_id' => $vote->user_id,
            ]),
            'status' => $vote->status,
            'weights' => [
                'ip_weight' => $this->ipWeight,
                'fp_weight' => $this->fpWeight,
                'ip_freq_weight' => $this->ipFreqWeight,
                'fp_freq_weight' => $this->fpFreqWeight,
            ],
            'limits' => [
                'approve_limit' => $this->approveLimit,
                'reject_limit' => $this->rejectLimit,
            ],
        ];
    }

    /**
     * Get statistics about suspicious votes
     */
    public function getSuspiciousVotesStats(): array
    {
        $totalVotes = Vote::count();
        $suspiciousVotes = Vote::where('anti_fraud_score', '>=', 50)->count();
        $highRiskVotes = Vote::where('anti_fraud_score', '>=', 75)->count();

        return [
            'total_votes' => $totalVotes,
            'suspicious_votes' => $suspiciousVotes,
            'high_risk_votes' => $highRiskVotes,
            'suspicious_percentage' => $totalVotes > 0 ? round(($suspiciousVotes / $totalVotes) * 100, 2) : 0,
        ];
    }
}
