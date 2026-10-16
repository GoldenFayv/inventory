<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Guard;
use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Permission\PermissionRegistrar;

use function Illuminate\Support\enum_value;

class Role extends SpatieRole
{
    use HasUuids;
    //

    public static function create(array $attributes = [])
    {
        $attributes['guard_name'] ??= Guard::getDefaultName(static::class);
        $attributes['name'] = enum_value($attributes['name']);

        $params = ['name' => $attributes['name'], 'guard_name' => $attributes['guard_name']];

        $registrar = app(PermissionRegistrar::class);

        if ($registrar->teams) {
            $teamsKey = $registrar->teamsKey;

            if (array_key_exists($teamsKey, $attributes)) {
                $params[$teamsKey] = $attributes[$teamsKey];
            } else {
                $attributes[$teamsKey] = getPermissionsTeamId();
            }
        }

        // if (static::findByParam($params)) {
        //     throw RoleAlreadyExists::create($attributes['name'], $attributes['guard_name']);
        // }

        return static::query()->create($attributes);
    }
}
