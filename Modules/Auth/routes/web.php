<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\Auth\ConfirmPasswordController;
use Modules\Auth\Http\Controllers\Auth\ForgotPasswordController;
use Modules\Auth\Http\Controllers\Auth\ResetPasswordController;
use Modules\Auth\Http\Controllers\Auth\VerificationController;
use Modules\Auth\Http\Controllers\AuthController;

Route::get("/login", [AuthController::class, "showLoginForm"])->name('login');
Route::get("/register", [AuthController::class, "showRegisterForm"])->name('register');
Route::post("/login", [AuthController::class, "login"])->name('signin');
Route::post("/signup", [AuthController::class, "register"])->name('signup');
Route::post("/logout", [AuthController::class, "logout"])->name("logout");
Route::get('/auth/{provider}', [AuthController::class, 'redirectToProvider'])->name('redirect-to-provider');
Route::get('/auth/{provider}/callback', [AuthController::class, 'handleProviderCallback']);

// Password Reset Routes
Route::get('/password/reset', [ForgotPasswordController::class, 'showLinkRequestForm'])->name('password.request');
Route::post('/password/email', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('password.email');
Route::get('/password/reset/{token}', [ResetPasswordController::class, 'showResetForm'])->name('password.reset');
Route::post('/password/reset', [ResetPasswordController::class, 'reset'])->name('password.update');

// Password Confirmation Routes
Route::get('/password/confirm', [ConfirmPasswordController::class, 'showConfirmForm'])->name('password.confirm');
Route::post('/password/confirm', [ConfirmPasswordController::class, 'confirm']);

// Email Verification Routes
Route::get('/email/verify', [VerificationController::class, 'show'])->name('verification.notice');
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::post('/email/resend', [VerificationController::class, 'resend'])->name('verification.resend');