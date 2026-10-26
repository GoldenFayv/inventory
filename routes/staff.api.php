<?php

use App\Enum\PermissionEnum;
use App\Http\Controllers\AssignRoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ToggleUserStatusController;
use Illuminate\Support\Facades\Route;

Route::get('permissions', PermissionController::class)->middleware(PermissionEnum::ASSIGN_PERMISSION->middleware());
Route::prefix('roles')->group(function () {
    Route::get('', [RoleController::class, 'index'])->middleware(PermissionEnum::ROLE_VIEW->middleware());
    Route::post('', [RoleController::class, 'store'])->middleware(PermissionEnum::ROLE_CREATE->middleware());
    Route::patch('{roleId}', [RoleController::class, 'update'])->middleware(PermissionEnum::ROLE_CREATE->middleware());
});

Route::prefix("staff")->group(function () {
    Route::get("", [StaffController::class, "index"])->middleware(PermissionEnum::STAFF_VIEW->middleware());
    Route::post("", [StaffController::class, "store"])->middleware(PermissionEnum::STAFF_CREATE->middleware());
    Route::put("{staffId}/role", AssignRoleController::class)->middleware(PermissionEnum::STAFF_UPDATE->middleware());
    Route::patch("{user_store_id}/status", ToggleUserStatusController::class)->middleware(PermissionEnum::STAFF_UPDATE->middleware());
});
