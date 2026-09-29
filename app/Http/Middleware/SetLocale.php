<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $lang = $request->route('lang');

        if ($lang) {
            $request->route()->forgetParameter('lang');
        } else $lang = 'en';

        App::setLocale($lang);

        Inertia::share('locale', $lang);

        return $next($request);
    }
}