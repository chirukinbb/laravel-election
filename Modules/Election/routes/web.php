<?php

use Illuminate\Support\Facades\Route;
use Modules\Election\Http\Controllers\AntiFraudController;
use Modules\Election\Http\Controllers\CandidateController;
use Modules\Election\Http\Controllers\ElectionController;
use Modules\Election\Http\Controllers\ModerationController;
use Modules\Election\Http\Controllers\WidgetController;

Route::middleware('auth')->group(function () {
    Route::prefix('election')->as('election:')->group(function () {
        Route::get('list', [ElectionController::class, 'index'])->name('list');
        Route::get('create', [ElectionController::class, 'create'])->name('create');
        Route::get('edit/{election:id}', [ElectionController::class, 'edit'])->name('edit');
        Route::get('show/{election:id}', [ElectionController::class, 'show'])->name('show');
        Route::get('report/{election:id}', [ElectionController::class, 'report'])->name('report');

        Route::post('store', [ElectionController::class, 'store'])->name('store');
        Route::patch('update/{election:id}', [ElectionController::class, 'update'])->name('update');
        Route::get('delete/{election:id}', [ElectionController::class, 'delete'])->name('delete');

        Route::prefix('{election:id}/candidate')->as('candidate:')->group(function () {
            Route::get('list', [CandidateController::class, 'index'])->name('list');
            Route::get('create', [CandidateController::class, 'create'])->name('create');
            Route::get('edit/{candidate:id}', [CandidateController::class, 'edit'])->name('edit');
            Route::get('proposedBy/{candidate:id}', [CandidateController::class, 'proposedBy'])->name('proposedBy');

            Route::post('store', [CandidateController::class, 'store'])->name('store');
            Route::patch('update/{candidate:id}', [CandidateController::class, 'update'])->name('update');
            Route::get('delete/{candidate:id}', [CandidateController::class, 'delete'])->name('delete');
        });
    });

    Route::get('candidates', [CandidateController::class, 'unbounded'])->name('candidates');

    Route::get('moderation', [ModerationController::class, 'index'])->name('moderation');

    Route::get('logs', [AntiFraudController::class, 'index'])->name('logs');
    Route::get('clean-logs', [AntiFraudController::class, 'clean'])->name('clean');
});

Route::get('widget', [WidgetController::class, 'index']);