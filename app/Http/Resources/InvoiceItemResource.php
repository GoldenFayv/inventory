<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
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
            "quantity" => $this->quantity,
            "unit_price" => $this->unit_price_naira,
            "subtotal" => $this->subtotal_naira,
            "product" => $this->whenLoaded("product", fn(): ItemProductResource => new ItemProductResource($this->product, $this->unit_price_naira))
        ];
    }
}
