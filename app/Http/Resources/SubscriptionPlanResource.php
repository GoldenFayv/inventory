<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "description" => $this->description,
            "prices" => $this->whenLoaded("prices", fn() => SubscriptionPlanPriceResource::collection($this->prices)),
            "features" => $this->whenLoaded("features", fn() => SubscriptionPlanFeatureResource::collection($this->features)),
        ];
    }
}
