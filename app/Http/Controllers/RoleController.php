<?php

namespace App\Http\Controllers;

use App\Actions\UpsertRole;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoleController extends Controller
{
    public function __construct(public UpsertRole $upsertRole) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $roles = Role::where("store_id", $user->active_store_id)->paginate($request->input("per_page", 10));

        return RoleResource::collection($roles);
    }
    public function store(Request $request)
    {
        $role = $this->upsertRole->handle($request->user(), $request->all());

        return new RoleResource($role);
    }

    public function update(Request $request, string $roleId)
    {
        $role = Role::findOrFail($roleId);

        $this->upsertRole->handle($request->user(), $request->all(), $role);

        return new RoleResource($role->refresh());
    }
}
