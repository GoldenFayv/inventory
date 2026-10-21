<?php

namespace App\Http\Controllers;

use App\Enum\PermissionEnum;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use App\Models\Store;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionController extends Controller
{
    public function __invoke(Request $request, PermissionService $permissionService): AnonymousResourceCollection
    {
        /** @var Store|null $store */
        $store = $request->user()->active_store;

        abort_if(! $store, 403, 'No store associated with this account');

        // Resolve the plan's features once, not once per permission
        // $allowedNames = collect(PermissionEnum::cases())
        //     ->filter(fn(PermissionEnum $p) => $store->hasFeature($p->feature()))
        //     ->map(fn(PermissionEnum $p) => $p->value);

        $allowedNames = $permissionService->availablePermissions($store);

        $groups = Permission::query()
            ->whereIn('name', $allowedNames)
            ->get()
            ->groupBy('category')
            ->map(fn($items, $category) => [
                'category'    => $category,
                'permissions' => PermissionResource::collection($items->values()),
            ])
            ->values();

        return new AnonymousResourceCollection($groups, JsonResource::class);
    }
}
