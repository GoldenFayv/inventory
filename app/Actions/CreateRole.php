<?php

namespace App\Actions;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CreateRole
{
    public function handle(User $user, array $data): Role
    {
        // Only the owner can create roles for their store.
        $store = $user->active_store;

        $guardName = 'user';

        try {
            $teamKey = config('permission.column_names.team_foreign_key', 'team_id');

            $validated = Validator::make($data, [
                'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->where(fn($query) => $query->where($teamKey, $store->id))->where('guard_name', $guardName),],
                'permission_ids' => ['present', 'array'],
                'permission_ids.*' => ['required', Rule::exists('permissions', 'id')->where('guard_name', $guardName),],
            ])->validate();

            return DB::transaction(function () use ($validated, $guardName) {
                $role = Role::create([
                    'name' => $validated['name'],
                    'guard_name' => $guardName,
                ]);

                $permissions = Permission::query()->whereIn('id', $validated['permission_ids'])->where('guard_name', $guardName)->get();

                $role->syncPermissions($permissions);

                return $role->load('permissions');
            });
        } finally {
            // Restore the previous team context.
            // $registrar->setPermissionsTeamId($previousTeamId);
        }
    }
}
