<?php

namespace App\Http\Controllers;

use App\Actions\Createstore;
use App\Actions\CreateUserStore;
use App\Actions\SwitchStore;
use App\Http\Resources\StoreResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    public function store(Request $request, Createstore $createStore, CreateUserStore $createUserStore, SwitchStore $switchStore): StoreResource
    {
        $user = $request->user();

        $store = DB::transaction(function () use ($request, $createStore, $createUserStore, $switchStore, $user) {
            $store = $createStore->handle($user, $request->all());

            $createUserStore->handle($user, $store);

            $switchStore->handle($user, $store);

            return $store;
        });

        return new StoreResource($store);
    }
}
