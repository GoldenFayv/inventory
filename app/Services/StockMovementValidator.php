<?php

namespace App\Services;

use App\DataTransferObjects\StockMovementItem;
use App\Enum\StockMovementType;
use App\Models\StockMovement;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class StockMovementValidator
{
    /**
     * Shape checks. No DB access, safe to run before opening a transaction.
     * @param  Collection<int, StockMovementItem>  $items
     */
    public function validateItems(Collection $items): void
    {
        if ($items->isEmpty()) {
            throw ValidationException::withMessages(['items' => 'At least one product is required.']);
        }

        $errors = [];
        $seen = [];

        foreach ($items as $i => $item) {
            $productId = $item->productId ?? null;

            if (! $productId) {
                $errors["items.$i.product_id"] = 'Product is required.';
            } elseif (isset($seen[$productId])) {
                $errors["items.$i.product_id"] = 'Duplicate product in list.';
            } else {
                $seen[$productId] = true;
            }

            if ((int) ($item->quantity ?? 0) < 1) {
                $errors["items.$i.quantity"] = 'Quantity must be at least 1.';
            }
        }

        $this->throwIfAny($errors);
    }

    /**
     * Every requested id must exist in the (already tenant-scoped) product set.
     * @param  Collection<int, StockMovementItem>  $items
     */
    public function ensureProductsExist(Collection $items, Collection $products): void
    {
        $errors = [];

        foreach ($items as $i => $item) {
            if (! $products->has($item->productId)) {
                $errors["items.$i.product_id"] = 'Product not found.';
            }
        }

        $this->throwIfAny($errors);
    }

    /**
     * Opening-stock and sufficient-balance rules.
     * Call this inside the transaction, after the product rows are locked.
     * @param  Collection<int, StockMovementItem>  $items
     */
    public function ensureStockRules(string $storeId, Collection $items, StockMovementType $type): void
    {
        $productIds = $items->pluck('productId')->all();

        $balances = StockMovement::where('store_id', $storeId)
            ->whereIn('product_id', $productIds)
            ->groupBy('product_id')
            ->selectRaw('product_id, SUM(quantity) as balance')
            ->pluck('balance', 'product_id');
;
        $hasOpening = $type === StockMovementType::OpeningStock
            ? StockMovement::where('store_id', $storeId)
            ->whereIn('product_id', $productIds)
            ->where('movement_type', $type)
            ->pluck('product_id')
            ->flip()
            : collect();

        $errors = [];

        foreach ($items as $i => $item) {
            $productId = $item->productId;
            $delta = $type->signedQuantity((int) $item->quantity);

            if ($hasOpening->has($productId)) {
                $errors["items.$i.product_id"] = 'Opening stock has already been recorded.';
                continue;
            }

            if ((int) ($balances[$productId] ?? 0) + $delta < 0) {
                $errors["items.$i.quantity"] = 'Insufficient stock.';
            }
        }

        $this->throwIfAny($errors);
    }

    private function throwIfAny(array $errors): void
    {
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }
}
