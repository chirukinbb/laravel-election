<?php

use Illuminate\Support\Facades\Route;
use Modules\Profile\Http\Controllers\ProfileController;

Route::middleware(['auth', 'verified'])->as('users::')->prefix('admin')->group(function () {
    Route::prefix('users')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])
            ->middleware('role:ADMIN')
            ->name('index');
        Route::get('/create', [ProfileController::class, 'create'])
            ->middleware('role.permission:create user')
            ->name('create');
        Route::post('/', [ProfileController::class, 'store'])
            ->middleware('role:admin')
            ->name('store');
        Route::put('/{user}/role', [ProfileController::class, 'updateRole'])
            ->middleware('role.permission:edit user role')
            ->name('update-role');
        Route::delete('/{user}', [ProfileController::class, 'destroy'])
            ->middleware('role.permission:edit user role')
            ->name('destroy');
    });
    Route::prefix('profile')->as('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('index');
        Route::get('/edit', [ProfileController::class, 'edit'])->name('edit');
        Route::put('/', [ProfileController::class, 'update'])->name('update');
    });
});
