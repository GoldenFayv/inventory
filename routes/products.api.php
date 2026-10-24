<?php

use App\Enum\PermissionEnum;
use App\Http\Controllers\Products\ProductController;
use App\Http\Controllers\Products\RestockController;
use App\Http\Controllers\SetProductStatusController;
use Illuminate\Support\Facades\Route;

Route::get('', [ProductController::class, 'index'])->middleware(PermissionEnum::PRODUCTS_VIEW->middleware());
Route::get('{productId}', [ProductController::class, 'show'])->middleware(PermissionEnum::PRODUCTS_VIEW->middleware());
Route::post('', [ProductController::class, 'store'])->middleware(PermissionEnum::PRODUCTS_CREATE->middleware());
Route::patch('{productId}', [ProductController::class, 'update'])->middleware(PermissionEnum::PRODUCTS_UPDATE->middleware());
Route::post('{productId}/status', SetProductStatusController::class)->middleware(PermissionEnum::PRODUCTS_UPDATE->middleware());
Route::post("restock", [RestockController::class, "store"]);
