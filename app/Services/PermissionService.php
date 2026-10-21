<?php

namespace App\Services;

use App\Actions\AssignPermission;
use App\Enum\PermissionEnum;
use App\Models\Store;
use App\Models\UserStore;

class PermissionService
{
    /**
     * Create a new class instance.
     */
    public function __construct(public AssignPermission $assignPermission)
    {
        //
    }

    public function availablePermissions(Store $store): array
    {
        return collect(PermissionEnum::cases())
            ->filter(
                fn(PermissionEnum $permission) =>
                $store->hasFeature($permission->feature())
            )
            ->map(fn(PermissionEnum $permission) => $permission->value)
            ->values()
            ->all();
    }

    public function assignPermissionToUser(UserStore $userStore): void
    {
        $permissions = $this->availablePermissions($userStore->store);

        $this->assignPermission->handle($userStore, $permissions);
    }
}
