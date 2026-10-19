<?php

namespace Tests\Feature;

use App\Actions\Subscriptions\CheckFeatureAccess;
use App\Enum\FeatureEnum;
use App\Enum\SubscriptionStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionFeatureAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_trial_allows_enabled_features_before_expiration(): void
    {
        $store = $this->createStore($this->createUser());

        $status = SubscriptionStatus::TRIALING;

        $planPrice = $this->createSubscriptionPlanPrice();

        $subscription = $this->subscribeStore($store, [FeatureEnum::INVENTORY], $status, $planPrice);

        $this->assertTrue(app(CheckFeatureAccess::class)->handle($store, FeatureEnum::INVENTORY));
    }

    public function test_expired_trial_does_not_allow_feature_access(): void
    {
        $store = $this->createStore($this->createUser());

        $status = SubscriptionStatus::TRIALING;

        $planPrice = $this->createSubscriptionPlanPrice();

        $this->createSubscriptionFeature($planPrice->plan, FeatureEnum::INVENTORY);

        $this->createSubscription($planPrice, $store, now()->subDays(15), $status);

        $this->assertFalse(app(CheckFeatureAccess::class)->handle($store, FeatureEnum::INVENTORY));
    }

    public function test_disabled_feature_is_not_available_during_trial(): void
    {
        $store = $this->createStore($this->createUser());

        $status = SubscriptionStatus::TRIALING;

        $planPrice = $this->createSubscriptionPlanPrice();

        $feature = FeatureEnum::INVENTORY;

        $this->createSubscriptionFeature($planPrice->plan, $feature, false);

        $this->createSubscription($planPrice, $store, now(), $status);

        $this->assertFalse(app(CheckFeatureAccess::class)->handle($store, $feature));
    }
}
