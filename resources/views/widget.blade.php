<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Election Widget</title>
    <script>
        window.AppData = {
            electionId: '{{ $election->id }}',
            apiToken: '{{ auth()->user()->createToken(\App\Enums\RoleEnum::USER->name)->plainTextToken }}',
            baseUrl: '{{ url('/') }}' // Полезно для путей API
        }
    </script>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
<div id="app"></div>
</body>
</html>