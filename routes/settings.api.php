<?php

use App\Http\Controllers\NotificationSettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('notifications')->group(function () {
    Route::get('', [NotificationSettingsController::class, 'show']);

    Route::patch('', [NotificationSettingsController::class, 'update']);
});
