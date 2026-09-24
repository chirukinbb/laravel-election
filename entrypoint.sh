#!/bin/bash
set -e

# 1. Create .env if it does not exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# 2. Install Composer dependencies if the autoloader is missing
if [ ! -f "vendor/autoload.php" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# 3. Generate the application key only if it is empty
if ! grep -q '^APP_KEY=base64:' .env; then
    echo "Generating application key..."
    php artisan key:generate --ansi --no-interaction
fi

# 4. Wait for the database to be reachable
echo "Waiting for database to be ready..."
DB_HOST_VAL="${DB_HOST:-db}"
DB_PORT_VAL="${DB_PORT:-3306}"
DB_USERNAME_VAL="${DB_USERNAME:-laravel_user}"
DB_PASSWORD_VAL="${DB_PASSWORD:-secret}"
until php -r 'try { $pdo = new PDO("mysql:host=$argv[1];port=$argv[2]", $argv[3], $argv[4]); exit(0); } catch (Throwable $e) { exit(1); }' "$DB_HOST_VAL" "$DB_PORT_VAL" "$DB_USERNAME_VAL" "$DB_PASSWORD_VAL"; do
    echo "Database is not ready yet, waiting..."
    sleep 2
done

# 5. Run migrations
echo "Running migrations..."
php artisan migrate --force

# 6. Clear caches
php artisan config:clear
php artisan route:clear

# 7. Start the development server
echo "Starting Laravel development server..."
exec php artisan serve --host=0.0.0.0 --port=8000
