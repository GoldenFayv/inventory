<?php

namespace App\Actions;

use App\Models\Role;
use App\Models\UserStore;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AssignRoleToUser
{
    public function handle(string $store_id, array $data, string $staff_id)
    {
        $teamKey = config('permission.column_names.team_foreign_key', 'team_id');

        $validated = Validator::make($data, [
            "role_id" => ["required", Rule::exists("roles", 'id')->where($teamKey, $store_id)],
        ])->validate();

        $staff = UserStore::where('store_id', $store_id)->where("user_id", $staff_id)->first();

        if (!$staff) {
            throw ValidationException::withMessages([
                "staff" => "Invalid staff selected"
            ]);
        }

        dispatch(function () use ($staff, $validated) {

            $role = Role::find($validated['role_id']);

            $staff->assignRole($role);
        });
    }
}
