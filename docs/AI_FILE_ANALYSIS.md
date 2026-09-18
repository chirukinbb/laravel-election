# AI File Analysis Command

This feature provides an automated way to analyze files stored in `storage/app` using OpenAI-compatible APIs via a
console command.

## Overview

The system consists of:

- **AnalyzeFileCommand**: CLI command that searches for a file and sends it to AI for analysis
- **OpenAIService**: Handles communication with OpenAI-compatible APIs

## Setup

### 1. Configure Environment Variables

Add the following to your `.env` file:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your-api-key-here
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

**Note**: This works with any OpenAI-compatible API (OpenAI, Azure OpenAI, local LLMs, etc.)

### 2. Run the Command

No queue worker needed! The command runs synchronously.

## Usage

### Basic Usage

```bash
php artisan file:analyze filename.txt
```

### With Custom Prompt

```bash
php artisan file:analyze report.pdf --prompt="Summarize the key findings in this report"
```

## Features

### File Search

- Automatically searches for files in `storage/app` and all subdirectories
- Matches by exact filename or partial path
- Supports nested directory structures

### File Type Detection

- Automatically detects MIME type
- Handles text-based files (TXT, JSON, HTML, CSS, JS, CSV, XML, etc.)
- Handles binary files (images, PDFs, etc.)

### Smart Content Handling

- Text files: Content is sent to AI for analysis (with size limits to respect token constraints)
- Binary files: Metadata and file type information is analyzed
- Large files are automatically truncated to fit within token limits

### Customizable Analysis

- Default prompt provides comprehensive analysis
- Optional custom prompt for specific analysis needs
- Configurable AI model and parameters

## Output

The command displays:

- File search progress
- File details (MIME type, size)
- AI analysis result
- Model and token usage information

Example output:

```bash
Searching for file: report.pdf
✓ File found at: reports/report.pdf
File details:
  - MIME Type: application/pdf
  - Size: 45678 bytes

Sending to AI for analysis...

✓ Analysis completed successfully!

AI Analysis Result:
--------------------------------------------------------------------------------
This is a comprehensive business report containing...
[AI analysis text]
--------------------------------------------------------------------------------

Model: gpt-4
Tokens used: 1234
```

## Logging

All operations are logged to Laravel's log file:

- Command start and completion
- File discovery results
- File metadata (MIME type, size)
- AI analysis results
- Errors and exceptions

Check logs at: `storage/logs/laravel.log`

## Supported AI Providers

This implementation works with any OpenAI-compatible API:

### OpenAI

```env
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-4
```

### Azure OpenAI

```env
OPENAI_API_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
OPENAI_MODEL=gpt-4
```

### Local LLM (e.g., Ollama, LM Studio)

```env
OPENAI_API_URL=http://localhost:11434/v1/chat/completions
OPENAI_MODEL=llama2
```

### Other Compatible APIs

- Groq
- Together AI
- Anyscale
- Any OpenAI-compatible endpoint

## Error Handling

The command includes comprehensive error handling:

- File not found: Displays error message and exits with failure code
- API errors: Displays detailed error information
- Network timeouts: Configurable timeout (default: 120 seconds)
- Invalid responses: Validates API response structure

## Customization

### Modify the Prompt

Edit the `buildPrompt()` method in `OpenAIService.php` to customize the default analysis prompt.

### Change File Size Limits

Modify the `$maxChars` variable in `analyzeFile()` method in `OpenAIService.php` to adjust content truncation limits.

### Add File Type Support

Update the `isTextFile()` method in `OpenAIService.php` to support additional MIME types.

## Example Use Cases

1. **Document Analysis**: Analyze uploaded documents and generate summaries
2. **Code Review**: Send code files for AI-powered code review
3. **Data Analysis**: Analyze CSV/JSON files for insights
4. **Content Moderation**: Check files for inappropriate content
5. **Metadata Extraction**: Extract structured information from unstructured files

## Testing

You can test the service directly in tinker:

```bash
php artisan tinker
```

```php
use App\Services\OpenAIService;
use Illuminate\Support\Facades\Storage;

$service = app(OpenAIService::class);
$contents = Storage::get('test.txt');
$mime = Storage::mimeType('test.txt');
$size = Storage::size('test.txt');

$result = $service->analyzeFile(
    filename: 'test.txt',
    fileContents: $contents,
    fileMime: $mime,
    fileSize: $size
);

dump($result['analysis']);
```
