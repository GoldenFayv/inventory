<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserStoreResource;
use App\Models\UserStore;
use Illuminate\Http\Request;

class ToggleUserStatusController extends Controller
{
    public function __invoke(Request $request, string $userStoreId)
    {
        $user = $request->user();

        $staff = UserStore::whereKey($userStoreId)->where("store_id", $user->active_store_id)->firstOrFail();

        $staff->update([
            "is_active" => !$staff->is_active
        ]);

        return new UserStoreResource($staff);
    }
}
