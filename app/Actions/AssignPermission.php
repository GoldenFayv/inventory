<?php

namespace App\Actions;

use App\Enum\PermissionEnum;
use App\Models\UserStore;

class AssignPermission
{
    /**
     * Summary of handle
     * @param UserStore $user
     * @param array<PermissionEnum> $permissions
     * @return void
     */
    public function handle(UserStore $user, array $permissions)
    {
        $user->syncPermissions($permissions);
    }
}
