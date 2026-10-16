<?php

namespace App\Http\Controllers;

use App\Actions\CreateRole;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        
        $roles = Role::where("store_id", $user->active_store_id)->paginate($request->input("per_page", 10));

        return RoleResource::collection($roles);
    }
    public function store(Request $request, CreateRole $createRole)
    {
        $role = $createRole->handle($request->user(), $request->all());

        return new RoleResource($role);
    }
}
