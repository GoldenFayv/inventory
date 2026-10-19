<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
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
            "billing_interval" => $this->billing_interval,
            "price" => $this->price,
            "ends_at" => $this->ends_at?->format('Y-m-d H:i:s'),
            "starts_at" => $this->starts_at?->format('Y-m-d H:i:s'),
            "cancelled_at" => $this->cancelled_at?->format('Y-m-d H:i:s'),
            "status" => $this->status,
            "plan" => $this->whenLoaded("plan", fn() => new SubscriptionPlanResource($this->plan))
        ];
    }
}
