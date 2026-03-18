#!/bin/bash

# Install composer dependencies if vendor directory is empty
if [ ! -f vendor/autoload.php ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Generate application key if not set
if [ ! -f .env ]; then
    cp .env.example .env
fi

php artisan key:generate --ansi

# Clear configuration cache
php artisan config:clear

# Run database migrations (optional, can be skipped in development)
# php artisan migrate --force

# Start Laravel development server
echo "Starting Laravel development server..."
exec php artisan serve --host=0.0.0.0 --port=8000