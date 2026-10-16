<?php

use App\Http\Controllers\AssignRoleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\SetProductStatusController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StoreController;
use App\Http\Resources\StateResource;
use App\Models\State;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix("auth")->group(function () {
        Route::post("register", RegistrationController::class);
        Route::post("refresh", [AuthController::class, "update"]);
        Route::post("login", [AuthController::class, "store"]);
        Route::get("me", [AuthController::class, "show"])->middleware('auth:user');
        Route::delete("logout", [AuthController::class, "destroy"])->middleware('auth:user');
    });

    Route::middleware('auth:user')->group(function () {
        Route::get("dashboard/summary", DashboardController::class);

        Route::get("states", function (): AnonymousResourceCollection {
            $states = State::with('local_govt_areas')->get();
            return StateResource::collection($states);
        });

        Route::prefix("stores")->group(function () {
            Route::post("", [StoreController::class, "store"]);
        });

        Route::prefix("roles")->group(function () {
            Route::post("", [RoleController::class, "store"]);
            Route::get("", [RoleController::class, "index"]);
        });

        Route::prefix("products")->group(function () {
            Route::get("", [ProductController::class, "index"]);
            Route::post("", [ProductController::class, "store"]);
            Route::patch("{productId}", [ProductController::class, "update"]);
            Route::get("{productId}", [ProductController::class, "show"]);
            Route::post("{productId}/status", SetProductStatusController::class);
        });

        Route::prefix("sales")->group(function () {
            Route::post("", [SalesController::class, "store"]);
            Route::patch("{saleId}", [SalesController::class, "update"]);
            Route::get("", [SalesController::class, "index"]);
            Route::get("{invoiceId}", [SalesController::class, "show"]);
        });

        Route::prefix("staff")->group(function () {
            Route::get("", [StaffController::class, "index"]);
            Route::post("", [StaffController::class, "store"]);
            Route::put("{staffId}/role", AssignRoleController::class);
        });
    });
});
