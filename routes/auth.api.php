<?php

use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChangePasswordController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::post("register", RegistrationController::class);
Route::post("refresh", [AuthController::class, "update"]);
Route::post("login", [AuthController::class, "store"]);
Route::delete("logout", [AuthController::class, "destroy"])->middleware('auth:user');

Route::get('email/verification/{id}/{hash}', [EmailVerificationController::class, 'verify'])->middleware('throttle:10,1')->name('verification.verify');
Route::post('email/verification', [EmailVerificationController::class, 'send'])->middleware(['throttle:3,1', 'auth:user']);


Route::prefix("profile")->middleware('auth:user')->group(function () {
    Route::get("", [AuthController::class, "show"]);
    Route::patch("", ProfileController::class);
    Route::put("password", ChangePasswordController::class);
});
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:3,1');

Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:5,1');
