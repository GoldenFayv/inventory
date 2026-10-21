<?php

namespace App\Http\Controllers;

use App\Actions\UpdateUser;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __invoke(Request $request, UpdateUser $updateUser)
    {
        $user = $updateUser->handle($request->user(), $request->all());

        return new UserResource($user);
    }
}
