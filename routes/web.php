<?php

use Illuminate\Support\Facades\Route;

Route::middleware('verify.shopify')->group(function () {
    Route::get("/", [\App\Http\Controllers\DashboardController::class, 'index'])->name("dashboard");
    Route::get("dashboard", [\App\Http\Controllers\DashboardController::class, 'index'])->name("dashboard1");

    Route::prefix('election')->as('election:')->middleware('election.ownership')->group(function () {
        Route::get('list', [\App\Http\Controllers\ElectionController::class, 'index'])->name('list');
        Route::get('create', [\App\Http\Controllers\ElectionController::class, 'create'])->name('create');
        Route::get('edit/{election:id}', [\App\Http\Controllers\ElectionController::class, 'edit'])->name('edit');
        Route::get('show/{election:id}', [\App\Http\Controllers\ElectionController::class, 'show'])->name('show');
        Route::get('report/{election:id}', [\App\Http\Controllers\ElectionController::class, 'report'])->name('report');

        Route::post('store', [\App\Http\Controllers\ElectionController::class, 'store'])->name('store');
        Route::patch('update/{election:id}', [\App\Http\Controllers\ElectionController::class, 'update'])->name('update');
        Route::get('delete/{election:id}', [\App\Http\Controllers\ElectionController::class, 'delete'])->name('delete');

        Route::prefix('{election:id}/candidate')->as('candidate:')->group(function () {
            Route::get('list', [\App\Http\Controllers\CandidateController::class, 'index'])->name('list');
            Route::get('create', [\App\Http\Controllers\CandidateController::class, 'create'])->name('create');
            Route::get('edit/{candidate:id}', [\App\Http\Controllers\CandidateController::class, 'edit'])->name('edit');

            Route::post('store', [\App\Http\Controllers\CandidateController::class, 'store'])->name('store');
            Route::patch('update/{candidate:id}', [\App\Http\Controllers\CandidateController::class, 'update'])->name('update');
            Route::get('delete/{candidate:id}', [\App\Http\Controllers\CandidateController::class, 'delete'])->name('delete');
        });
    });

    Route::get('moderation', [\App\Http\Controllers\ModerationController::class, 'index'])->name('moderation');

    Route::get('settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings');
    Route::put('settings', [\App\Http\Controllers\SettingsController::class, 'update'])->name('settings.update');

    Route::get('logs', [\App\Http\Controllers\AntiFraudController::class, 'index'])->name('logs');
    Route::get('clean-logs', [\App\Http\Controllers\AntiFraudController::class, 'clean'])->name('clean');
});

Route::get('widget', [\App\Http\Controllers\WidgetController::class, 'index'])->middleware(\App\Http\Middlewares\ShopifyMiddleware::class);