<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class SetPermissionsTeam
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if the user is logged in and has an active store ID
        if (Auth::check() && Auth::user()->active_store_id) {
            app(PermissionRegistrar::class)->setPermissionsTeamId(Auth::user()->active_store_id);
        }

        return $next($request);
    }
}
