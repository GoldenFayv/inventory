<?php

namespace App\Http\Controllers;

use App\Actions\Createstore;
use App\Actions\CreateUserStore;
use App\Actions\SwitchStore;
use App\Actions\UpdateStore;
use App\Http\Resources\StoreResource;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    public function store(Request $request, Createstore $createStore, CreateUserStore $createUserStore, SwitchStore $switchStore, SubscriptionService $subscriptionService): StoreResource
    {
        $user = $request->user();

        $store = DB::transaction(function () use ($request, $createStore, $createUserStore, $subscriptionService, $switchStore, $user) {
            $store = $createStore->handle($user, $request->all());

            $createUserStore->handle($user, $store);

            $switchStore->handle($user, $store);

            // $subscriptionService->startTrialPlan($store);

            return $store;
        });

        return new StoreResource($store);
    }

    public function update(Request $request, UpdateStore $updateStore)
    {
        return new StoreResource($updateStore->handle($request->user(), $request->all()));
    }
}
