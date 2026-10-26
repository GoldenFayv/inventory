<?php

namespace App\Actions;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UpsertRole
{
    public function handle(User $user, array $data, ?Role $role = null): Role
    {
        $store   = $user->active_store;

        $validated = Validator::make($data, [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')
                    ->where(fn($query) => $query->where('store_id', $store->id))
                    ->ignore($role?->id),
            ],
            'permission_ids'   => ['present', 'array'],
            'permission_ids.*' => [
                'required',
                Rule::exists('permissions', 'id')
            ],
        ])->validate();

        return DB::transaction(function () use ($validated, $role, $store) {
            $role = Role::updateOrCreate(
                ['id' => $role?->id, 'store_id' => $store->id],
                ['name' => $validated['name']]
            );

            $permissions = Permission::query()->whereIn('id', $validated['permission_ids'])->get();

            $role->syncPermissions($permissions);

            return $role->load('permissions');
        });
    }
}
