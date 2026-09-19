<?php

use Illuminate\Support\Facades\Route;
use Modules\Election\Http\Controllers\Api\AdminController;
use Modules\Election\Http\Controllers\Api\VotingController;

// Voting Module Routes
Route::middleware(['auth:sanctum', 'abilities:' . \App\Enums\RoleEnum::ADMIN->name . ',' . \App\Enums\RoleEnum::USER->name])
    ->prefix('voting')->group(function () {
        // Public voting routes
        Route::get('/candidates/search', [VotingController::class, 'searchCandidates'])->name('voting.candidates.search');
        Route::get('/candidates/{id}', [VotingController::class, 'candidate'])->name('voting.candidate');
        Route::post('/vote', [VotingController::class, 'vote'])->name('voting.vote');
        Route::post('/candidate/suggest', [VotingController::class, 'suggestCandidate'])->name('voting.candidate.suggest')->middleware('pending.candidates');
        Route::post('/verify-captcha', [VotingController::class, 'verifyCaptcha'])->name('voting.verify-captcha');
        Route::get('/top50', [VotingController::class, 'top50'])->name('voting.top50');
        Route::get('/countries', [VotingController::class, 'countries'])->name('voting.countries');
    });
Route::get('/candidates', [VotingController::class, 'candidates'])->middleware('web')->name('voting.candidates');

// Admin Routes
Route::middleware(['auth:sanctum', 'abilities:' . \App\Enums\RoleEnum::ADMIN->name])
    ->prefix('admin')->group(function () {
        Route::post('/candidate/approve', [AdminController::class, 'approveCandidate'])->name('admin.candidate.approve');
        Route::post('/candidate/reject', [AdminController::class, 'rejectCandidate'])->name('admin.candidate.reject');
        Route::post('/candidate/merge', [AdminController::class, 'mergeCandidates'])->name('admin.candidate.merge');
        Route::post('/candidate/bind', [AdminController::class, 'bindWithElection'])->name('admin.candidate.bind');
        Route::post('/vote/flag', [AdminController::class, 'flagVote'])->name('admin.vote.flag');
        Route::post('/vote/approve', [AdminController::class, 'approveVote'])->name('admin.vote.approve');
        Route::post('/vote/reject', [AdminController::class, 'rejectVote'])->name('admin.vote.reject');

        // Anti-fraud routes
        Route::get('/vote/fraud-analysis', [AdminController::class, 'getVoteFraudAnalysis'])->name('admin.vote.fraud-analysis');
        Route::post('/vote/reanalyze-fraud', [AdminController::class, 'reanalyzeVoteFraud'])->name('admin.vote.reanalyze-fraud');
        Route::get('/votes/suspicious-stats', [AdminController::class, 'getSuspiciousVotesStats'])->name('admin.votes.suspicious-stats');
        Route::get('/votes/suspicious', [AdminController::class, 'getSuspiciousVotes'])->name('admin.votes.suspicious');
    });