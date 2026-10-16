<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $client = $request->user();
        $users = User::whereHas(
            'user_stores',
            fn(Builder $builder) => $builder->where("store_id", $client->active_store_id)
        )
            ->with([
                "user_stores" => fn(Builder $builder) => $builder->where("store_id", $client->active_store_id)->with('last_login')
            ])
            ->paginate($request->input('per_page', 10));
        return UserResource::collection($users);
    }
}
