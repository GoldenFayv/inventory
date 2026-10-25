<?php

namespace App\Http\Controllers;

use App\Http\Resources\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PlanController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $plans = SubscriptionPlan::with(['prices', 'features' => fn(HasMany $query) => $query->whereIsEnabled(true)])->whereForFreeTrial(false)->whereNull('store_id')->whereIsActive(true)->get();

        return SubscriptionPlanResource::collection($plans);
    }
}
