<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
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
            "total_amount" => $this->total_amount_naira,
            "total_amount_paid" => $this->total_amount_paid_naira,
            "generated_at" => $this->created_at,
            "reference" => $this->reference ?? "INV-204322-MSJS98DN7",
            "customer" => [
                "name" => $this->customer_name,
                "phone" => $this->customer_phone,
                "email" => $this->customer_email,
                "address" => $this->customer_address,
            ],
            "generated_by" => $this->whenLoaded("generatedBy", fn() => new UserResource($this->generatedBy)),
            "items" => $this->whenLoaded("items", fn(): AnonymousResourceCollection => InvoiceItemResource::collection($this->items)),
            "payments" => $this->whenLoaded("payments", fn(): AnonymousResourceCollection => PaymentResource::collection($this->payments)),
            "store" => $this->whenLoaded("store", fn() => new StoreResource(($this->store))),
        ];
    }
}
