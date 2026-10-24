<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesReturnItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sales_return_id' => $this->sales_return_id,
            'invoice_item_id' => $this->invoice_item_id,
            'product_id' => $this->product_id,

            'product' => $this->whenLoaded('product', function () {
                return $this->product ? [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'sku' => $this->product->sku,
                ] : null;
            }),

            'quantity' => $this->quantity,
            'unit_price' => toKobo($this->unit_price),
            'subtotal' => toNaira($this->subtotal),
            'condition' => $this->condition,
            'restock_quantity' => $this->restock_quantity,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
