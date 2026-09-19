<?php

namespace App\Services;

use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use OpenAI;
use OpenAI\Client as OpenAIClient;


class OpenAIService
{
    protected OpenAIClient $client;
    protected Client $guzzleClient;
    protected string $model;

    public function __construct()
    {
        $apiKey = config('services.openai.api_key');
        $baseUrl = config('services.openai.api_url', 'https://api.openai.com/v1/');
        $this->model = config('services.openai.model', 'gpt-4o');

        if (!$apiKey) {
            throw new Exception('OpenAI API key is not configured');
        }

        // Initialize OpenAI client
        $this->client = OpenAI::factory()
            ->withApiKey($apiKey)
            ->withBaseUri($baseUrl)
            ->make();

        $this->guzzleClient = new Client([
            'base_uri' => $baseUrl,
            'headers' => [
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    /**
     * Analyze a file using OpenAI client.
     *
     * @param string $filename
     * @param string $fileContents
     * @param string $fileMime
     * @param int $fileSize
     * @param string|null $customPrompt
     * @return array
     * @throws Exception
     */
    public function analyzeFile(
        string  $filename,
        string  $fileContents,
        string  $fileMime,
        int     $fileSize,
        ?string $customPrompt = null
    ): array
    {
        // Build the prompt
        $prompt = $this->buildImagePrompt($filename, $fileMime, $fileSize, $customPrompt);

        // Convert image to base64 for Vision API
        $base64Image = base64_encode($fileContents);
        $imageUrl = "data:{$fileMime};base64,{$base64Image}";

        try {
            // Create response with image input (using Vision API format)
            $response = $this->client->chat()->create([
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => $prompt
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => $imageUrl
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            $analysis = $response->choices[0]->message->content;
            $usage = $response->usage;

            Log::info('OpenAI analysis completed', [
                'filename' => $filename,
                'tokens_used' => $usage->totalTokens ?? 'unknown',
            ]);

            return [
                'success' => true,
                'analysis' => $analysis,
                'model' => $this->model,
                'tokens_used' => $usage->totalTokens ?? null,
                'filename' => $filename,
            ];

        } catch (Exception $e) {
            Log::error('OpenAI API call failed', [
                'error' => $e->getMessage(),
                'filename' => $filename,
            ]);
            throw $e;
        }
    }

    /**
     * Upload file to OpenAI Files API.
     *
     * @param string $filename
     * @param string $fileContents
     * @param string $fileMime
     * @return string file_id
     * @throws Exception
     */
    protected function uploadFileToOpenAI(
        string $filename,
    ): string
    {
        Log::info('Try to upload file to OpenAI', ['filename' => $filename]);

        try {
            // Upload file using OpenAI client
            $file = $this->client->files()->upload([
                'purpose' => 'fine-tune',
                'file' => fopen(Storage::path($filename), 'r'),
            ]);

            $fileId = $file->id;

            Log::info('File uploaded to OpenAI', [
                'filename' => $filename,
                'file_id' => $fileId,
            ]);

            return $fileId;

        } catch (Exception $e) {
            Log::error('File upload failed', [
                'error' => $e->getMessage(),
                'filename' => $filename,
            ]);
            throw $e;
        }
    }

    /**
     * Delete uploaded file from OpenAI.
     *
     * @param string $fileId
     * @return void
     */
    protected function deleteFileFromOpenAI(string $fileId): void
    {
        try {
            $response = $this->client->files()->delete($fileId);

            if ($response->deleted) {
                Log::info('File deleted from OpenAI', [
                    'file_id' => $fileId,
                ]);
            } else {
                Log::warning('Failed to delete file from OpenAI', [
                    'file_id' => $fileId,
                ]);
            }
        } catch (Exception $e) {
            Log::warning('Error deleting file from OpenAI', [
                'error' => $e->getMessage(),
                'file_id' => $fileId,
            ]);
        }
    }

    /**
     * Build image analysis prompt.
     *
     * @param string $filename
     * @param string $imageMime
     * @param int $imageSize
     * @param string|null $customPrompt
     * @return string
     */
    protected function buildImagePrompt(
        string  $filename,
        string  $imageMime,
        int     $imageSize,
        ?string $customPrompt = null
    ): string
    {
        $prompt = "Please analyze this image in detail:\n\n";
        $prompt .= "Filename: {$filename}\n";
        $prompt .= "Format: {$imageMime}\n";
        $prompt .= "Size: {$imageSize} bytes\n\n";

        if ($customPrompt) {
            $prompt .= "Specific question: {$customPrompt}\n\n";
        }

        $prompt .= "Please provide a comprehensive description including:\n";
        $prompt .= "1. Main subject and objects in the image\n";
        $prompt .= "2. Colors, lighting, and composition\n";
        $prompt .= "3. Setting, background, and context\n";
        $prompt .= "4. Any text visible in the image (if present)\n";
        $prompt .= "5. Mood, atmosphere, and style\n";
        $prompt .= "6. Notable details or interesting features\n";
        $prompt .= "7. Image quality and technical aspects\n\n";
        $prompt .= "Respond in Russian with a clear, structured description.";

        return $prompt;
    }

    /**
     * Check if file is an image.
     *
     * @param string $mime
     * @return bool
     */
    protected function isImageFile(string $mime): bool
    {
        $imageMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/bmp',
            'image/tiff',
        ];

        foreach ($imageMimes as $imageMime) {
            if (str_starts_with($mime, $imageMime)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Analyze file using OpenRouter API with pure cURL.
     *
     * @param string $filename
     * @param string $fileContents
     * @param string $fileMime
     * @param int $fileSize
     * @param string|null $customPrompt
     * @return array
     * @throws Exception
     */
    public function analyzeWithOpenRouter(
        string  $filename,
        string  $fileContents,
        string  $fileMime,
        int     $fileSize,
        ?string $customPrompt = null
    ): array
    {
        $apiKey = config('services.openai.api_key');
        $model = config('services.openai.model', 'openai/gpt-4o');

        if (!$apiKey) {
            throw new Exception('OpenRouter API key is not configured');
        }

        // Build prompt
        $promptText = $this->buildImagePrompt($filename, $fileMime, $fileSize, $customPrompt);

        // Convert file to base64
        $base64File = base64_encode($fileContents);

        // Prepare request body
        $requestBody = [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => $promptText,
                        ],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => "data:{$fileMime};base64,{$base64File}"
                            ]
                        ],
                    ],
                ],
            ],
        ];

        try {
            // Make request using Guzzle
            $response = $this->guzzleClient->post('v1/chat/completions', [
                'json' => $requestBody,
            ]);

            // Get response body
            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['choices'][0]['message']['content'])) {
                throw new Exception('Invalid response structure from OpenRouter');
            }

            $analysis = $data['choices'][0]['message']['content'];
            $usage = $data['usage'] ?? [];

            Log::info('OpenRouter analysis completed', [
                'filename' => $filename,
                'model' => $model,
                'tokens_used' => $usage['total_tokens'] ?? 'unknown',
            ]);

            return [
                'success' => true,
                'analysis' => $analysis,
                'model' => $model,
                'tokens_used' => $usage['total_tokens'] ?? null,
                'filename' => $filename,
            ];

        } catch (GuzzleException $e) {
            Log::error('OpenRouter Guzzle request failed', [
                'error' => $e->getMessage(),
                'filename' => $filename,
                'code' => $e->getCode(),
            ]);
            throw new Exception('OpenRouter API request failed: ' . $e->getMessage(), $e->getCode(), $e);

        } catch (Exception $e) {
            Log::error('OpenRouter API call failed', [
                'error' => $e->getMessage(),
                'filename' => $filename,
            ]);
            throw $e;
        }
    }
}
