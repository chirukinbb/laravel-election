<?php

use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get("/", [\App\Http\Controllers\DashboardController::class, 'index'])->name("dashboard");
    Route::get("dashboard", [\App\Http\Controllers\DashboardController::class, 'index'])->name("dashboard1");
    Route::get('settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings');
    Route::put('settings', [\App\Http\Controllers\SettingsController::class, 'update'])->name('settings.update');
});

Route::get('widget', [\App\Http\Controllers\WidgetController::class, 'index']);//->middleware('auth.proxy');