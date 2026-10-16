<?php

namespace App\Actions;

use App\Models\Store;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;

class SwitchStore
{
    public function handle(User $user, Store $store): void
    {
        $isMember = $user->user_stores()->where('store_id', $store->id)->exists();

        if (!$isMember) {
            throw new AuthorizationException("User is not a member of this store.");
        }

        $user->update([
            "active_store_id" => $store->id
        ]);
    }
}
