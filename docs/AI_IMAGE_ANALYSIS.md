# AI Image Analysis Command

This feature provides automated image analysis using OpenAI Vision API. It searches for image files in `storage/app` and
sends them to AI for detailed description.

## Overview

The system consists of:

- **AnalyzeFileCommand**: CLI command that searches for an image and sends it to Vision AI for analysis
- **OpenAIService**: Handles communication with OpenAI Vision API

## Setup

### 1. Configure Environment Variables

Add the following to your `.env` file:

```env
# OpenAI API Configuration for Vision
OPENAI_API_KEY=your-api-key-here
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=2000
```

**Recommended models for image analysis:**

- `gpt-4o` - Best overall (recommended)
- `gpt-4-turbo` - Good balance of speed and quality
- `gpt-4-vision-preview` - Legacy vision model

### 2. Run the Command

No queue worker needed! The command runs synchronously.

## Usage

### Basic Usage

```bash
php artisan file:analyze photo.jpg
```

### With Custom Question

```bash
php artisan file:analyze product.png --prompt="What brand is this product?"
php artisan file:analyze document.jpg --prompt="Extract all text from this image"
php artisan file:analyze scene.jpg --prompt="Describe the mood and atmosphere"
```

## Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- WebP
- SVG
- BMP
- TIFF

## Features

### Image Search

- Automatically searches for images in `storage/app` and all subdirectories
- Matches by exact filename or partial path
- Supports nested directory structures

### Vision API Integration

- Uses OpenAI's Vision API for image understanding
- Sends images as base64-encoded data
- Supports high-detail analysis mode
- Handles images up to 20MB (OpenAI limit)

### Smart Analysis

The default prompt asks AI to describe:

1. Main subject and objects in the image
2. Colors, lighting, and composition
3. Setting, background, and context
4. Any text visible in the image (OCR)
5. Mood, atmosphere, and style
6. Notable details or interesting features
7. Image quality and technical aspects

**Responses are in Russian** by default.

### Custom Questions

You can ask specific questions about the image using the `--prompt` option.

## Output

The command displays:

- Image search progress
- Image details (format, size)
- AI analysis result
- Model and token usage information

Example output:

```bash
Searching for file: product.jpg
✓ File found at: uploads/product.jpg
Image details:
  - Format: image/jpeg
  - Size: 245678 bytes

Sending to AI for analysis...

✓ Analysis completed successfully!

AI Analysis Result:
--------------------------------------------------------------------------------
На изображении представлен продукт...
[Подробное описание изображения на русском языке]
--------------------------------------------------------------------------------

Model: gpt-4o
Tokens used: 1234
```

## Logging

All operations are logged to Laravel's log file:

- Command start and completion
- Image discovery results
- Image metadata (format, size)
- AI analysis results
- Errors and exceptions

Check logs at: `storage/logs/laravel.log`

## Supported AI Providers

This implementation works with any OpenAI-compatible Vision API:

### OpenAI

```env
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-4o
```

### Azure OpenAI

```env
OPENAI_API_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-12-01-preview
OPENAI_MODEL=gpt-4
```

### Other Compatible APIs

- Groq (with vision support)
- Together AI
- Any OpenAI-compatible vision endpoint

## Error Handling

The command includes comprehensive error handling:

- File not found: Displays error message and exits with failure code
- Not an image: Displays error if file is not an image format
- API errors: Displays detailed error information
- Network timeouts: Configurable timeout (default: 120 seconds)
- Invalid responses: Validates API response structure

## Customization

### Modify the Prompt

Edit the `buildImagePrompt()` method in `OpenAIService.php` to customize the default analysis prompt or change the
response language.

### Change Token Limits

Modify `max_tokens` in `.env` or config to adjust response length:

```env
OPENAI_MAX_TOKENS=3000
```

### Change Image Detail Level

In `OpenAIService.php`, change the `detail` parameter:

- `'high'` - More detailed analysis (slower, more tokens)
- `'low'` - Faster processing (fewer tokens)

## Example Use Cases

1. **Product Catalog**: Automatically generate product descriptions from photos
2. **Content Moderation**: Analyze uploaded images for inappropriate content
3. **Accessibility**: Generate alt-text for images
4. **OCR**: Extract text from scanned documents or photos
5. **Image Tagging**: Automatically tag images with descriptions
6. **Quality Control**: Analyze product photos for quality issues

## Testing

You can test the service directly in tinker:

```bash
php artisan tinker
```

```php
use App\Services\OpenAIService;
use Illuminate\Support\Facades\Storage;

$service = app(OpenAIService::class);
$contents = Storage::get('test.jpg');
$mime = Storage::mimeType('test.jpg');
$size = Storage::size('test.jpg');

$result = $service->analyzeFile(
    filename: 'test.jpg',
    fileContents: $contents,
    fileMime: $mime,
    fileSize: $size
);

dump($result['analysis']);
```

## Notes

- Images are sent as base64-encoded data (no file upload needed)
- Maximum image size is 20MB (OpenAI Vision API limit)
- High-resolution images may use more tokens
- Response time depends on image complexity and API load
- All responses are in Russian by default (can be changed in the prompt)
