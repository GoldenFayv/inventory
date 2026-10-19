<?php

namespace App\Http\Middleware;

use App\Actions\Subscriptions\CheckFeatureAccess;
use App\Enum\FeatureEnum;
use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStoreHasFeature
{
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $feature = FeatureEnum::tryFrom($feature);

        $store = $request->user()->active_store;

        abort_unless($store instanceof Store, 403, 'No active store selected.');

        $allowed = app(CheckFeatureAccess::class)->handle($store, $feature);

        if (! $allowed) {
            return response()->json([
                'message' => 'Your current subscription does not include this feature, or your subscription has expired.',
                'feature' => $feature,
            ], 403);
        }

        return $next($request);
    }
}
