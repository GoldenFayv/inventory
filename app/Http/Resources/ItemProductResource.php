<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemProductResource extends JsonResource
{
    protected int $customSellingPrice;

    // Capture the dynamic price from the caller
    public function __construct(mixed $resource, ?int $customSellingPrice = null)
    {
        parent::__construct($resource);
        $this->customSellingPrice = $customSellingPrice;
    }
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
            "selling_price" => $this->customSellingPrice ?? $this->selling_price_naira,
            "store" => $this->whenLoaded("store", fn(): StoreResource => new StoreResource($this->store)),
            "media" => $this->whenLoaded("media", fn() => MediaResource::collection($this->media))
        ];
    }
}
