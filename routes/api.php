<?php

use App\Enum\FeatureEnum;
use App\Enum\PermissionEnum;
use App\Http\Controllers\ActivateFreeTrialController;
use App\Http\Controllers\AssignRoleController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChangePasswordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationSettingsController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\SetProductStatusController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\ToggleUserStatusController;
use App\Http\Controllers\VerifyTrxController;
use App\Http\Controllers\Webhooks\WhatsAppWebhookController;
use App\Http\Resources\StateResource;
use App\Models\State;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::match(['GET', 'POST'], 'webhooks/whatsapp', WhatsAppWebhookController::class)->name('webhooks.whatsapp');
    Route::prefix("auth")->group(function () {
        Route::post("register", RegistrationController::class);
        Route::post("refresh", [AuthController::class, "update"]);
        Route::post("login", [AuthController::class, "store"]);
        Route::get("me", [AuthController::class, "show"])->middleware('auth:user');
        Route::delete("logout", [AuthController::class, "destroy"])->middleware('auth:user');


        Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:3,1');

        Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:5,1');
    });

    Route::middleware('auth:user')->group(function () {
        Route::prefix('settings')->group(function () {
            Route::prefix('notifications')->group(function () {
                Route::get('', [NotificationSettingsController::class, 'show']);

                Route::patch('', [NotificationSettingsController::class, 'update']);
            });
        });

        Route::prefix("stores")->group(function () {
            Route::post("", [StoreController::class, "store"]);
            Route::patch("", [StoreController::class, "update"]);
        });

        Route::prefix("profile")->group(function () {
            Route::patch("", ProfileController::class);
            Route::put("password", ChangePasswordController::class);
        });
        Route::get("states", function (): AnonymousResourceCollection {
            $states = State::with('local_govt_areas')->get();
            return StateResource::collection($states);
        });

        Route::prefix("plans")->group(function () {
            Route::post("{plan_plan_id}/subscribe", [SubscriptionController::class, "store"]);
            Route::get("", PlanController::class);
        });

        Route::post("subscriptions/trial", ActivateFreeTrialController::class);

        Route::get("transactions/{reference}/verify", VerifyTrxController::class);

        Route::middleware([FeatureEnum::INVENTORY->middleware()])->group(function () {
            Route::middleware([FeatureEnum::STAFF_MANAGEMENT->middleware()])->group(function () {
                Route::get("dashboard/summary", DashboardController::class)->middleware([PermissionEnum::DASHBOARD_VIEW->middleware()]);
            });

            Route::get('permissions', PermissionController::class);

            Route::prefix('products')->middleware([FeatureEnum::INVENTORY->middleware()])->group(function () {
                Route::get('', [ProductController::class, 'index'])->middleware(PermissionEnum::PRODUCTS_VIEW->middleware());
                Route::get('{productId}', [ProductController::class, 'show'])->middleware(PermissionEnum::PRODUCTS_VIEW->middleware());
                Route::post('', [ProductController::class, 'store'])->middleware(PermissionEnum::PRODUCTS_CREATE->middleware());
                Route::patch('{productId}', [ProductController::class, 'update'])->middleware(PermissionEnum::PRODUCTS_UPDATE->middleware());
                Route::post('{productId}/status', SetProductStatusController::class)->middleware(PermissionEnum::PRODUCTS_UPDATE->middleware());
            });

            Route::prefix("sales")->middleware([FeatureEnum::SALES->middleware()])->group(function () {
                Route::post("", [SalesController::class, "store"])->middleware(PermissionEnum::SALES_CREATE->middleware());
                Route::patch("{saleId}", [SalesController::class, "update"])->middleware(PermissionEnum::SALES_UPDATE->middleware());
                Route::get("", [SalesController::class, "index"])->middleware(PermissionEnum::SALES_VIEW->middleware());
                Route::get("{invoiceId}", [SalesController::class, "show"])->middleware(PermissionEnum::SALES_VIEW->middleware());
            });

            Route::middleware([FeatureEnum::STAFF_MANAGEMENT->middleware()])->group(function () {
                Route::prefix('roles')->group(function () {
                    Route::get('', [RoleController::class, 'index'])->middleware(PermissionEnum::ROLE_VIEW->middleware());
                    Route::post('', [RoleController::class, 'store'])->middleware(PermissionEnum::ROLE_CREATE->middleware());
                });

                Route::prefix("staff")->group(function () {
                    Route::get("", [StaffController::class, "index"])->middleware(PermissionEnum::STAFF_VIEW->middleware());
                    Route::post("", [StaffController::class, "store"])->middleware(PermissionEnum::STAFF_CREATE->middleware());
                    Route::put("{staffId}/role", AssignRoleController::class)->middleware(PermissionEnum::STAFF_UPDATE->middleware());
                    Route::patch("{user_store_id}/status", ToggleUserStatusController::class)->middleware(PermissionEnum::STAFF_UPDATE->middleware());
                });
            });
        });
    });
});
