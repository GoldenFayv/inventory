<?php

namespace App\Actions\Subscriptions;

use App\Enum\BillingInterval;
use App\Enum\FeatureEnum;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use InvalidArgumentException;

class UpsertPlan
{
    public function handle(array $data, ?Model $plan = null): SubscriptionPlan
    {
        if ($plan !== null && ! $plan instanceof SubscriptionPlan) {
            throw new InvalidArgumentException('Invalid model.');
        }

        $validated = Validator::make($data, [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('subscription_plans', 'name')
                    ->where('store_id', $plan?->store_id ?? ($data['store_id'] ?? null))
                    ->ignore($plan?->getKey()),
            ],
            'description' => ['required', 'string'],
            'store_id' => ['sometimes', 'nullable', 'uuid', 'exists:stores,id'],
            'for_free_trial' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],

            'features' => ['sometimes', 'array'],
            'features.*.feature' => [
                'required',
                'distinct',
                Rule::enum(FeatureEnum::class),
            ],
            'features.*.is_enabled' => ['required', 'boolean'],
            'features.*.feature_limit' => ['nullable', 'integer', 'min:0'],

            'prices' => ['sometimes', 'array'],
            'prices.*.billing_interval' => [
                'required',
                'distinct',
                Rule::enum(BillingInterval::class),
            ],
            'prices.*.price' => ['required', 'numeric', 'min:0'],
            'prices.*.currency' => ['required', 'string', 'size:3', 'in:NGN'],
            'prices.*.is_active' => ['required', 'boolean'],
        ], [
            'name.unique' => 'A plan with this name already exists.',
            'features.*.feature.distinct' => 'Each feature can only be added once.',
            'prices.*.billing_interval.distinct' => 'Each billing interval can only be added once.',
        ])->validate();

        return DB::transaction(function () use ($validated, $plan) {
            $plan ??= new SubscriptionPlan([
                'store_id' => $validated['store_id'] ?? null,
                'name' => $validated['name'],
            ]);

            $plan->fill([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'for_free_trial' => $validated['for_free_trial'] ?? false,
            ]);

            $plan->save();

            $featureRows = collect($validated['features'] ?? [])->keyBy(fn(array $row) => $row['feature']);

            foreach (FeatureEnum::cases() as $feature) {
                $row = $featureRows->get($feature->value);

                $plan->features()->updateOrCreate(
                    ['feature' => $feature->value],
                    [
                        'is_enabled' => $row['is_enabled'] ?? false,
                        'feature_limit' => $row['feature_limit'] ?? null,
                    ]
                );
            }

            foreach ($validated['prices'] ?? [] as $priceData) {
                $interval = $priceData['billing_interval'];

                if (is_string($interval)) {
                    $interval = BillingInterval::tryFrom($interval);

                    if (! $interval) {
                        throw new InvalidArgumentException(
                            'Invalid subscription billing interval.'
                        );
                    }
                }

                $plan->prices()->updateOrCreate(
                    ['billing_interval' => $interval->value],
                    [
                        'price' => $priceData['price'],
                        'currency' => $priceData['currency'] ?? 'NGN',
                        'is_active' => $priceData['is_active'] ?? true,
                    ]
                );
                logger("Prices 2", [
                    "plan" => $plan->toArray(),
                    "prices" => $plan->prices->toArray()
                ]);
            }


            return $plan->load(['features', 'prices']);
        });
    }
}
