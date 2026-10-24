<?php

namespace App\Actions\Products;

use App\Enum\ProductCondition;
use App\Enum\SalesReturnStatus;
use App\Models\Invoice;
use App\Models\SalesReturn;
use App\Models\SalesReturnItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RequestSalesReturn
{
    public function handle(User $user, string $invoiceId, array $data): SalesReturn
    {
        $storeId = $user->active_store_id;

        if (! $storeId) {
            throw ValidationException::withMessages([
                'invoice_id' => 'No active store selected.',
            ]);
        }

        return DB::transaction(function () use ($user, $storeId, $invoiceId, $data) {
            $invoice = Invoice::query()
                ->where('store_id', $storeId)
                ->lockForUpdate()
                ->findOrFail($invoiceId);

            $requestedItems = collect($data['items'])->keyBy('invoice_item_id');

            if ($requestedItems->count() !== count($data['items'])) {
                throw ValidationException::withMessages([
                    'items' => 'An invoice item may only appear once per return request.',
                ]);
            }

            $invoiceItems = $invoice->items()
                ->whereIn('id', $requestedItems->keys())
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($invoiceItems->count() !== $requestedItems->count()) {
                throw ValidationException::withMessages([
                    'items' => 'One or more items do not belong to this invoice.',
                ]);
            }

            $return = SalesReturn::create([
                'store_id' => $storeId,
                'invoice_id' => $invoice->id,
                'reference' => generateReference('RET'),
                'status' => 'pending',
                'reason' => $data['reason'],
                'requested_by' => $user->id,
            ]);

            foreach ($requestedItems as $invoiceItemId => $requested) {
                $invoiceItem = $invoiceItems->get($invoiceItemId);
                $quantity = (int) $requested['quantity'];

                $alreadyReturned = SalesReturnItem::query()
                    ->where('invoice_item_id', $invoiceItemId)
                    ->whereHas('salesReturn', function ($query) {
                        $query->whereIn('status', [SalesReturnStatus::PENDING, SalesReturnStatus::APPROVED]);
                    })
                    ->sum('quantity');

                if ($quantity < 1 || $alreadyReturned + $quantity > $invoiceItem->quantity) {
                    throw ValidationException::withMessages([
                        "items.{$invoiceItemId}.quantity" =>
                        'Return quantity exceeds the quantity still eligible for return.',
                    ]);
                }

                $condition = ProductCondition::tryFrom($requested['condition']);

                if (! in_array($condition, [ProductCondition::SALEABLE, ProductCondition::DAMAGED], true)) {
                    throw ValidationException::withMessages([
                        "items.{$invoiceItemId}.condition" => 'Condition must be saleable or damaged.',
                    ]);
                }

                $restockQuantity = $condition === ProductCondition::SALEABLE ? $quantity : 0;
                $damagedQuantity = $condition === ProductCondition::DAMAGED ? $quantity : 0;

                SalesReturnItem::create([
                    'sales_return_id' => $return->id,
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

            return $return->calculateTotals()->load('items');
        });
    }
}
