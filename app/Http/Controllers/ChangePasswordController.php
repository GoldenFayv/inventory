<?php

namespace App\Http\Controllers;

use App\Actions\UpdateUser;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class ChangePasswordController extends Controller
{
    public function __invoke(Request $request, UpdateUser $updateUser)
    {
        return new UserResource($updateUser->handle($request->user(), $request->all()));
    }
}
