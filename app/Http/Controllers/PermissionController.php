<?php

namespace App\Http\Controllers;

use App\Enum\FeatureEnum;
use App\Enum\PermissionEnum;
use App\Http\Resources\PermissionResource;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var Store|null $store */
        $store = $request->user()->active_store;

        abort_if(! $store, 403, 'No store associated with this account');

        $permissions = collect(PermissionEnum::definitions())
            ->filter(fn(array $d) => $store->hasFeature(FeatureEnum::from($d['feature'])))
            ->groupBy('category')
            ->map(fn($items, $category) => [
                'category'    => $category,
                'permissions' => $items->values()->map(fn($d) => new PermissionResource($d)),
            ])
            ->values();

        return response()->json(['data' => $permissions]);
    }
}
