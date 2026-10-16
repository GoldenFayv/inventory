<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = config("permission-data");

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                [
                    'name' => $permission['name'],
                    'guard_name' => 'user',
                ],
                [
                    'description' => $permission['description'],
                    'category' => $permission['category'],
                    'feature' => $permission['feature'],
                ]
            );
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
