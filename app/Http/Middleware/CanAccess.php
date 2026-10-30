<?php

namespace App\Http\Middleware;

use App\Enum\PermissionEnum;
use App\Models\Store;
use App\Models\UserStore;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CanAccess
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        abort_if(! $user, 401, 'Unauthenticated');

        /** @var UserStore|null $userStore */
        $userStore = $user->user_store;

        // Allow a user without a store to create their first one
        if (! $userStore) {
            if ($request->isMethod('POST') && $request->is('api/v1/store')) {
                return $next($request);
            }

            abort(403, 'No store associated with this account');
        }

        /**
         * @var  Store $store
         */

        $store = $userStore->store;

        $enum = PermissionEnum::tryFrom($permission);

        abort_if(! $enum, 500, "Unknown permission [$permission]");

        if (! $store->hasFeature($enum->feature())) {
            abort(402, 'Your current plan does not include this feature.');
        }

        abort_unless($userStore->hasPermissionTo($permission) || $userStore->isOwner(), 403, 'Access denied');

        return $next($request);
    }
}
