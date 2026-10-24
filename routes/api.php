<?php

use App\Enum\FeatureEnum;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\Subscription\ActivateFreeTrialController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\VerifyTrxController;
use App\Http\Controllers\Webhooks\WhatsAppWebhookController;
use App\Http\Resources\StateResource;
use App\Models\State;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::match(['GET', 'POST'], 'webhooks/whatsapp', WhatsAppWebhookController::class)->name('webhooks.whatsapp');
    Route::prefix("auth")->group(function () {
        require_once base_path("routes/auth.api.php");
    });

    Route::middleware('auth:user')->group(function () {
        Route::prefix('settings')->group(function () {
            require_once base_path("routes/settings.api.php");
        });

        Route::prefix("stores")->group(function () {
            Route::post("", [StoreController::class, "store"]);
            Route::patch("", [StoreController::class, "update"]);
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
            Route::prefix('products')->middleware([FeatureEnum::INVENTORY->middleware()])->group(function () {
                require_once base_path("routes/products.api.php");
            });

            Route::prefix("sales")->middleware([FeatureEnum::SALES->middleware()])->group(function () {
                require_once base_path("routes/sales.api.php");
            });

            Route::middleware([FeatureEnum::STAFF_MANAGEMENT->middleware()])->group(function () {
                require_once base_path("routes/staff.api.php");
            });
        });
    });
});
