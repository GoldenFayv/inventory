<?php

namespace App\Http\Controllers;

use App\Http\Resources\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function __invoke(Request $request)
    {
        $plans = SubscriptionPlan::with(['prices', 'features'])->whereForFreeTrial(false)->whereNull('store_id')->whereIsActive(true)->get();

        return SubscriptionPlanResource::collection($plans);
    }
}
