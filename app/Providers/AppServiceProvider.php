<?php

namespace App\Providers;

use Anhskohbo\NoCaptcha\Facades\NoCaptcha;
use App\Services\SettingsService;
use Illuminate\Foundation\AliasLoader;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $loader = AliasLoader::getInstance();
        $loader->alias('NoCaptcha', NoCaptcha::class);

        $this->app->singleton(SettingsService::class, function ($app) {
            return new SettingsService(isFull: Request::is('admin*'));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
        if ($this->app->environment('local')) {
            URL::forceRootUrl(config('app.url'));
        }

        if (config('app.url')) {
            URL::forceRootUrl(config('app.url'));
        }

        if (!Request::is('admin*')) {
            $segment = Request::segment(1);
            $locales = ['en', 'ru', 'es'];
            URL::defaults([
                'lang' => in_array($segment, $locales) ? $segment : config('app.fallback_locale'),
            ]);
        }
    }
}
