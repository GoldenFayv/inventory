<?php

namespace App\Http\Resources;

use App\Enum\SubscriptionPaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPaymentResource extends JsonResource
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
            "reference" => $this->reference,
            "amount" => $this->amount_naira,
            "status" => $this->status,
            "checkout" => $this->when($this->status === SubscriptionPaymentStatus::PENDING, $this->provider_payload)
        ];
    }
}
