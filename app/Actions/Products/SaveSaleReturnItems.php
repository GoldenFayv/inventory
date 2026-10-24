<?php

namespace App\Actions\Products;

use App\Enum\ProductCondition;
use App\Models\SalesReturn;
use Illuminate\Support\Collection;

class SaveSaleReturnItems
{
    public function handle(SalesReturn $return, Collection $requestedItems, Collection $invoiceItems)
    {
        foreach ($requestedItems as $invoiceItemId => $requested) {
            $invoiceItem = $invoiceItems->get($invoiceItemId);
            $quantity = (int) $requested['quantity'];

            $condition = ProductCondition::tryFrom($requested['condition']);

            $restockQuantity = $condition === ProductCondition::SALEABLE ? $quantity : 0;
            $damagedQuantity = $condition === ProductCondition::DAMAGED ? $quantity : 0;

            $return->items()->create([
                'invoice_item_id' => $invoiceItem->id,
                'product_id' => $invoiceItem->product_id,
                'quantity' => $quantity,
                'unit_price' => $invoiceItem->unit_price,
                'subtotal' => $quantity * $invoiceItem->unit_price,
                'condition' => $condition,
                'restock_quantity' => $restockQuantity,
                'damaged_quantity' => $damagedQuantity,
                'reason' => $requested['reason'] ?? null,
            ]);
        }
    }
}
