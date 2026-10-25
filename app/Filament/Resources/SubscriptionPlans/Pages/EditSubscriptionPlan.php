<?php

namespace App\Filament\Resources\SubscriptionPlans\Pages;

use App\Actions\Subscriptions\UpsertPlan;
use App\Filament\Resources\SubscriptionPlans\SubscriptionPlanResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Override;

class EditSubscriptionPlan extends EditRecord
{
    protected static string $resource = SubscriptionPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }

    #[Override]
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['features'] = $this->record->features
            ->map(fn($feature) => [
                'feature' => $feature->feature->value,
                'is_enabled' => $feature->is_enabled,
                'feature_limit' => $feature->feature_limit,
            ])
            ->values()
            ->all();

        $data['prices'] = $this->record->prices
            ->map(fn($price) => [
                'billing_interval' => $price->billing_interval->value,
                'price' => toNaira($price->price),
                'currency' => $price->currency,
                'is_active' => $price->is_active,
            ])
            ->values()
            ->all();

        return $data;
    }


    #[Override]
    protected function handleRecordUpdate(
        Model $record,
        array $data
    ): Model {
        return app(UpsertPlan::class)->handle($data, $record);
    }
}
