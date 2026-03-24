<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
    return view("welcome");
});

// Authentication routes
Route::get("/", [AuthController::class, "showLoginForm"])->name("login");
Route::withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->post("/login", [AuthController::class, "login"])->name('signin');
Route::withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->post("/register", [AuthController::class, "register"])->name('register');
Route::withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->post("/logout", [AuthController::class, "logout"])->name("logout");

Route::middleware(\Spatie\Permission\Middleware\RoleMiddleware::using(\App\Enums\RoleEnum::ADMIN->name))->group(function () {
    Route::get("dashboard", [\App\Http\Controllers\DashboardController::class, 'index'])->name("dashboard");

    Route::prefix('election')->as('election:')->group(function () {
        Route::get('list', [\App\Http\Controllers\ElectionController::class, 'index'])->name('list');
        Route::get('create', [\App\Http\Controllers\ElectionController::class, 'create'])->name('create');
        Route::get('edit/{election:id}', [\App\Http\Controllers\ElectionController::class, 'edit'])->name('edit');
        Route::get('show/{election:id}', [\App\Http\Controllers\ElectionController::class, 'show'])->name('show');

        Route::post('store', [\App\Http\Controllers\ElectionController::class, 'store'])->name('store');
        Route::patch('update/{election:id}', [\App\Http\Controllers\ElectionController::class, 'update'])->name('update');
        Route::delete('delete/{election:id}', [\App\Http\Controllers\ElectionController::class, 'delete'])->name('delete');

        Route::prefix('{election:id}/candidate')->as('candidate:')->group(function () {
            Route::get('list', [\App\Http\Controllers\CandidateController::class, 'index'])->name('list');
            Route::get('create', [\App\Http\Controllers\CandidateController::class, 'create'])->name('create');
            Route::get('edit/{candidate:id}', [\App\Http\Controllers\CandidateController::class, 'edit'])->name('edit');

            Route::post('store', [\App\Http\Controllers\CandidateController::class, 'store'])->name('store');
            Route::patch('update/{candidate:id}', [\App\Http\Controllers\CandidateController::class, 'update'])->name('update');
            Route::delete('delete/{candidate:id}', [\App\Http\Controllers\CandidateController::class, 'delete'])->name('delete');
        });
    });
});

Route::get('widget', function () {
    dd(request()->all());
});