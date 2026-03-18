<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleCloudController;
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

// Simple dashboard (protected)
Route::get("/dashboard", [\App\Http\Controllers\DashboardController::class, 'index'])->middleware('auth')->name("dashboard");

