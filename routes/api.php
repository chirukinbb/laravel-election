<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum')->name('api.user');

// Voting Module Routes
Route::middleware(['auth:sanctum', 'abilities:' . \App\Enums\RoleEnum::ADMIN->name . ',' . \App\Enums\RoleEnum::USER->name])
    ->prefix('voting')->group(function () {
        // Public voting routes
        Route::get('/candidates/search', [\App\Http\Controllers\Api\VotingController::class, 'searchCandidates'])->name('voting.candidates.search');
        Route::get('/candidates/{id}', [\App\Http\Controllers\Api\VotingController::class, 'candidate'])->name('voting.candidate');
        Route::post('/vote', [\App\Http\Controllers\Api\VotingController::class, 'vote'])->name('voting.vote');
        Route::post('/candidate/suggest', [\App\Http\Controllers\Api\VotingController::class, 'suggestCandidate'])->name('voting.candidate.suggest');
        Route::post('/verify-captcha', [\App\Http\Controllers\Api\VotingController::class, 'verifyCaptcha'])->name('voting.verify-captcha');
        Route::get('/top50', [\App\Http\Controllers\Api\VotingController::class, 'top50'])->name('voting.top50');
        Route::get('/countries', [\App\Http\Controllers\Api\VotingController::class, 'countries'])->name('voting.countries');
    });
Route::get('/candidates', [\App\Http\Controllers\Api\VotingController::class, 'candidates'])->name('voting.candidates');

// Admin Routes
Route::middleware(['auth:sanctum', 'abilities:' . \App\Enums\RoleEnum::ADMIN->name])
    ->prefix('admin')->group(function () {
        Route::post('/candidate/approve', [\App\Http\Controllers\Api\AdminController::class, 'approveCandidate'])->name('admin.candidate.approve');
        Route::post('/candidate/reject', [\App\Http\Controllers\Api\AdminController::class, 'rejectCandidate'])->name('admin.candidate.reject');
        Route::post('/candidate/merge', [\App\Http\Controllers\Api\AdminController::class, 'mergeCandidates'])->name('admin.candidate.merge');
        Route::post('/vote/flag', [\App\Http\Controllers\Api\AdminController::class, 'flagVote'])->name('admin.vote.flag');
        Route::post('/vote/approve', [\App\Http\Controllers\Api\AdminController::class, 'approveVote'])->name('admin.vote.approve');
        Route::post('/vote/reject', [\App\Http\Controllers\Api\AdminController::class, 'rejectVote'])->name('admin.vote.reject');
    });
