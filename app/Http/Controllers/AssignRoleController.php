<?php

namespace App\Http\Controllers;

use App\Actions\AssignRoleToUser;
use Illuminate\Http\Request;

class AssignRoleController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $staffId, AssignRoleToUser $assignRoleToUser)
    {
        $assignRoleToUser->handle($request->user()->active_store_id, $request->all(), $staffId);

        return response()->json([
            "message" => "Assignment Successful"
        ]);
    }
}
