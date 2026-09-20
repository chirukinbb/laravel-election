<?php

namespace App\Console\Commands;

use App\Enums\SettingKeyEnum;
use App\Services\SettingsService;
use Illuminate\Console\Command;
use Modules\Election\Services\AntiFraudService;

class AnalyzeFraudScores extends Command
{
    protected $signature = 'antifraud:analyze {--batch-size=100 : Number of votes to analyze per batch}';
    protected $description = 'Analyze fraud scores for all votes';

    private AntiFraudService $antiFraudService;

    public function __construct()
    {
        parent::__construct();
    }

    private function createAntiFraudService(): AntiFraudService
    {
        $settingsService = app(SettingsService::class);

        return new AntiFraudService(
            ipWeight: (int)$settingsService->get(SettingKeyEnum::ScoreIP),
            fpWeight: (int)$settingsService->get(SettingKeyEnum::ScoreFP),
            ipFreqWeight: (int)$settingsService->get(SettingKeyEnum::RateLimitIP),
            fpFreqWeight: (int)$settingsService->get(SettingKeyEnum::RateLimitFP),
            approveLimit: (int)$settingsService->get(SettingKeyEnum::VoteApproveLimit),
            rejectLimit: (int)$settingsService->get(SettingKeyEnum::VoteRejectLimit)
        );
    }

    public function handle(): int
    {
        $this->info('Starting fraud score analysis...');

        $this->antiFraudService = $this->createAntiFraudService();

        $batchSize = $this->option('batch-size');
        $totalVotes = Vote::count();

        if ($totalVotes === 0) {
            $this->info('No votes found to analyze.');
            return Command::SUCCESS;
        }

        $this->info("Found {$totalVotes} votes to analyze.");

        $bar = $this->output->createProgressBar($totalVotes);
        $bar->start();

        $analyzed = 0;
        $suspicious = 0;
        $suspiciousThreshold = config('antifraud.thresholds.suspicious_threshold', 50);

        Vote::chunk($batchSize, function ($votes) use ($bar, &$analyzed, &$suspicious, $suspiciousThreshold) {
            foreach ($votes as $vote) {
                $this->antiFraudService->analyzeVote($vote);
                $analyzed++;

                if ($vote->anti_fraud_score >= $suspiciousThreshold) {
                    $suspicious++;
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();

        $this->info("Analysis complete!");
        $this->info("Analyzed: {$analyzed} votes");
        $this->info("Suspicious: {$suspicious} votes");

        // Show statistics
        $stats = $this->antiFraudService->getSuspiciousVotesStats();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Votes', $stats['total_votes']],
                ['Suspicious Votes', $stats['suspicious_votes']],
                ['High Risk Votes', $stats['high_risk_votes']],
                ['Suspicious Percentage', $stats['suspicious_percentage'] . '%'],
            ]
        );

        return Command::SUCCESS;
    }
}
