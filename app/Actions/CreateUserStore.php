<?php

namespace App\Actions;

use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;

class CreateUserStore
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function handle(User $user, Store $store)
    {
        UserStore::updateOrCreate([
            "user_id" => $user->id,
            "store_id" => $store->id
        ], []);
    }
}
