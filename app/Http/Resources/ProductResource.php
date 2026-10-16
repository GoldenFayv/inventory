<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            "sku" => $this->sku,
            "selling_price" => $this->selling_price_naira,
            "cost_price" => $this->cost_price_naira,
            "low_stock_threshold" => $this->low_stock_threshold,
            "quantity" => $this->quantity,
            "is_active" => $this->is_active,
            "store" => $this->whenLoaded("store", fn(): StoreResource => new StoreResource($this->store)),
            "media" => $this->whenLoaded("media", fn() => MediaResource::collection($this->media))
        ];
    }
}
