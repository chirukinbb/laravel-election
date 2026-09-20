<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Models\Candidate;
use Modules\Election\Models\Election;
use Spatie\LaravelPdf\Facades\Pdf;

class ElectionResumeCommand extends Command
{
    protected $signature = 'election:resume {election_id}';

    protected $description = 'Generate a PDF report of the top 50 winning candidates';

    public function handle()
    {
        $electionId = $this->argument('election_id');

        $election = Election::find($electionId);

        if (!$election) {
            $this->error("Election with ID {$electionId} not found.");
            return Command::FAILURE;
        }

        $this->info("Generating top 50 candidates report for election: {$election->name}");

        $topCandidates = Candidate::query()
            ->withCount(['votes' => function ($query) {
                $query->where('status', VoteStatusEnum::Verified);
            }])
            ->where('election_id', $electionId)
            ->where('status', CandidateStatusEnum::Approved)
            ->orderByDesc('votes_count')
            ->limit(50)
            ->get();

        if ($topCandidates->isEmpty()) {
            $this->warn("No candidates found for election: {$election->name}");
            return Command::FAILURE;
        }

        $this->info("Found {$topCandidates->count()} candidates. Generating PDF...");

        $fileName = "election_{$electionId}_top50_report.pdf";
        $filePath = storage_path("app/{$fileName}");

        Pdf::view('pdf.top50-candidates', [
            'election' => $election,
            'candidates' => $topCandidates,
            'generatedAt' => now()->format('Y-m-d H:i:s'),
        ])->save($filePath);

        $this->info("PDF report generated successfully: {$filePath}");

        return Command::SUCCESS;
    }
}
