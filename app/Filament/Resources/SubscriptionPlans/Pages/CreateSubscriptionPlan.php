<?php

namespace App\Filament\Resources\SubscriptionPlans\Pages;

use App\Actions\Subscriptions\UpsertPlan;
use App\Filament\Resources\SubscriptionPlans\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use Filament\Resources\Pages\CreateRecord;

class CreateSubscriptionPlan extends CreateRecord
{
    protected static string $resource = SubscriptionPlanResource::class;

    protected function handleRecordCreation(array $data): SubscriptionPlan
    {
        return app(UpsertPlan::class)->handle($data);
    }
}
