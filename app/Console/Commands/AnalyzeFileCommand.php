<?php

namespace App\Console\Commands;

use App\Services\OpenAIService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Console\Command\Command as CommandAlias;

class AnalyzeFileCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'file:analyze 
                            {filename : The filename to analyze in storage/app}
                            {--prompt= : Custom prompt for AI analysis}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analyze an image file from storage/app using AI Vision API';

    /**
     * Execute the console command.
     */
    public function handle(OpenAIService $openAIService): int
    {
        $filename = $this->argument('filename');
        $customPrompt = $this->option('prompt');

        $this->info("Searching for file: {$filename}");

        // Search for the file in storage/app
        $filePath = $this->findFile($filename);

        if (!$filePath) {
            $this->error("File not found in storage/app: {$filename}");
            return CommandAlias::FAILURE;
        }

        $this->info("✓ File found at: {$filePath}");

        try {
            // Get file contents
            $fileContents = Storage::get($filePath);
            $fileMime = Storage::mimeType($filePath);
            $fileSize = Storage::size($filePath);

            $this->info("File details:");
            $this->line("  - MIME Type: {$fileMime}");
            $this->line("  - Size: {$fileSize} bytes");
            $this->newLine();

            $this->info("Sending to AI for analysis...");

            // Send to OpenAI for analysis
            $analysis = $openAIService->analyzeFile(
                filename: $filename,
                fileContents: $fileContents,
                fileMime: $fileMime,
                fileSize: $fileSize,
                customPrompt: $customPrompt
            );

            $this->newLine();
            $this->info("✓ Analysis completed successfully!");
            $this->newLine();

            // Display the analysis
            $this->info("AI Analysis Result:");
            $this->line(str_repeat('-', 80));
            $this->line($analysis['analysis']);
            $this->line(str_repeat('-', 80));
            $this->newLine();

            $this->info("Model: {$analysis['model']}");
            if ($analysis['tokens_used']) {
                $this->info("Tokens used: {$analysis['tokens_used']}");
            }

            Log::info("File analysis completed successfully", [
                'filename' => $filename,
                'file_path' => $filePath,
                'analysis' => $analysis['analysis'],
            ]);

            return CommandAlias::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to analyze file: {$e->getMessage()}");

            Log::error("Failed to analyze file: {$filename}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return CommandAlias::FAILURE;
        }
    }

    /**
     * Find file in storage/app directory.
     *
     * @param string $filename
     * @return string|false
     */
    protected function findFile(string $filename): string|false
    {
        // Check if file exists directly
        if (Storage::exists($filename)) {
            return $filename;
        }

        // Try to find in subdirectories
        $files = Storage::allFiles();// php artisan file:analyze img.png

        foreach ($files as $file) {
            if (basename($file) === $filename || str_ends_with($file, $filename)) {
                return $file;
            }
        }

        return false;
    }
}
