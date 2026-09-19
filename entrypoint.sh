#!/bin/bash
set -e

# 1. Создаем .env, если его нет
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# 2. Устанавливаем зависимости, если нет автозагрузчика (даже если папка vendor пустая)
if [ ! -f "vendor/autoload.php" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# 3. Генерируем ключ
echo "Generating application key..."
php artisan key:generate --ansi --no-interaction

# 4. Очищаем кеш
echo "Clearing config cache..."
php artisan config:clear

# 5. Явно запускаем сервер
echo "Starting Laravel development server..."
exec php artisan serve --host=0.0.0.0 --port=8000