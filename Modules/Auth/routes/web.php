<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;

Route::get("/login", [AuthController::class, "showLoginForm"])->name('login');
Route::get("/register", [AuthController::class, "showRegisterForm"])->name('register');
Route::post("/login", [AuthController::class, "login"])->name('signin');
Route::post("/signup", [AuthController::class, "register"])->name('signup');
Route::post("/logout", [AuthController::class, "logout"])->name("logout");
Route::get('/auth/{provider}', [AuthController::class, 'redirectToProvider'])->name('redirect-to-provider');
Route::get('/auth/{provider}/callback', [AuthController::class, 'handleProviderCallback']);