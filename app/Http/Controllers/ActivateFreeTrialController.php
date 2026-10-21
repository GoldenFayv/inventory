<?php

namespace App\Http\Controllers;

use App\Http\Resources\SubscriptionPaymentResource;
use App\Services\PermissionService;
use App\Services\SubscriptionPaymentService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivateFreeTrialController extends Controller
{
    public function __invoke(Request $request, SubscriptionService $subscriptionService, SubscriptionPaymentService $subscriptionPaymentService, PermissionService $permissionService): SubscriptionPaymentResource
    {
        return DB::transaction(function () use ($subscriptionService, $subscriptionPaymentService, $request, $permissionService): SubscriptionPaymentResource {
            $payment = $subscriptionService->activateTrialPlan($request->user()->active_store);

            $subscriptionPaymentService->completePayment($payment, [
                "amount" => $payment->amount,
                "reference" => $payment->reference,
                "status" => "success",
                "currency" => "NGN"
            ]);

            $permissionService->assignPermissionToUser($request->user()->user_store);

            return new SubscriptionPaymentResource($payment->refresh());
        });
    }
}
