<?php

use App\Enum\FeatureEnum;
use App\Enum\PermissionEnum;
use App\Http\Controllers\Products\SalesReturnController;
use App\Http\Controllers\SalesController;
use Illuminate\Support\Facades\Route;

Route::post('{invoiceId}/returns', [SalesReturnController::class, 'store'])->middleware(PermissionEnum::SALES_RETURNS_CREATE->middleware());
Route::prefix("returns")->middleware(FeatureEnum::SALES_RETURNS->middleware())->group(function () {
    Route::get('', [SalesReturnController::class, 'index'])->middleware(PermissionEnum::SALES_RETURNS_VIEW->middleware());
    Route::get('{returnId}', [SalesReturnController::class, 'show'])->middleware(PermissionEnum::SALES_RETURNS_VIEW->middleware());
    Route::post('/{returnId}/status', [SalesReturnController::class, 'update'])->middleware(PermissionEnum::SALES_RETURNS_APPROVE->middleware());
});
Route::post("", [SalesController::class, "store"])->middleware(PermissionEnum::SALES_CREATE->middleware());
Route::patch("{saleId}", [SalesController::class, "update"])->middleware(PermissionEnum::SALES_UPDATE->middleware());
Route::get("", [SalesController::class, "index"])->middleware(PermissionEnum::SALES_VIEW->middleware());
Route::get("{invoiceId}", [SalesController::class, "show"])->middleware(PermissionEnum::SALES_VIEW->middleware());
