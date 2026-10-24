<?php

namespace App\Services\Products;

use App\Actions\Products\GetSaleReturn;
use App\Actions\Products\RecordDamagedProducts;
use App\Actions\Products\RejectSalesReturn;
use App\Actions\Products\SaveSaleReturnItems;
use App\Actions\RecordStockMovement;
use App\DataTransferObjects\StockMovementItem;
use App\Enum\ProductCondition;
use App\Enum\SalesReturnStatus;
use App\Enum\StockMovementType;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\SalesReturn;
use App\Models\SalesReturnItem;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalesReturnService
{
    public function __construct(public GetSaleReturn $getSaleReturn, public SaveSaleReturnItems $saveItems, public RecordStockMovement $recordStockMovement, public RejectSalesReturn $rejectSalesReturn) {}

    public function request(Invoice $invoice, User $user, array $data)
    {
        return DB::transaction(function () use ($user, $data, $invoice) {
            $invoice = Invoice::query()->where('store_id', $user->active_store_id)->lockForUpdate()->findOrFail($invoice->getKey());

            $requestedItems = collect($data['items'])->keyBy('invoice_item_id');

            if ($requestedItems->count() !== \count($data['items'])) {
                throw ValidationException::withMessages([
                    'items' => 'An invoice item may only appear once per return request.',
                ]);
            }

            $invoiceItems = $invoice->items()->whereIn('id', $requestedItems->keys())->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            if ($invoiceItems->count() !== $requestedItems->count()) {
                throw ValidationException::withMessages([
                    'items' => 'One or more items do not belong to this invoice.',
                ]);
            }

            $this->validateQuantityNCondition($requestedItems, $invoiceItems);

            $saleReturn = $this->getSaleReturn->handle($invoice, $user, $data['reason']);

            $this->saveItems->handle($saleReturn, $requestedItems, $invoiceItems);

            return $saleReturn->calculateTotals()->load('items');
        });
    }

    private function validateQuantityNCondition(Collection $requestedItems, Collection $invoiceItems)
    {
        foreach ($requestedItems as $invoiceItemId => $requested) {
            $invoiceItem = $invoiceItems->get($invoiceItemId);
            $quantity = (int) $requested['quantity'];

            $alreadyReturned = SalesReturnItem::query()
                ->where('invoice_item_id', $invoiceItemId)
                ->whereHas('salesReturn', function ($query) {
                    $query->whereIn('status', [SalesReturnStatus::PENDING, SalesReturnStatus::APPROVED]);
                })
                ->sum('quantity');

            if ($quantity < 1 || ($alreadyReturned + $quantity) > ($invoiceItem->quantity + $invoiceItem->returned_quantity)) {
                throw ValidationException::withMessages([
                    "items.{$invoiceItemId}.quantity" =>
                    'Return quantity exceeds the quantity still eligible for return.',
                ]);
            }

            $raw = $requested['condition'];

            $condition = $raw instanceof ProductCondition ? $raw : ProductCondition::tryFrom($raw);

            if (! in_array($condition, [ProductCondition::SALEABLE, ProductCondition::DAMAGED], true)) {
                throw ValidationException::withMessages([
                    "items.{$invoiceItemId}.condition" => 'Condition must be saleable or damaged.',
                ]);
            }
        }
    }
    private function validateQuantityNConditionForApproval(Collection $requestedItems, Collection $invoiceItems)
    {
        foreach ($requestedItems as $invoiceItemId => $requested) {
            $invoiceItem = $invoiceItems->get($invoiceItemId);
            $quantity = (int) $requested['quantity'];

            if ($quantity < 1 || $quantity > $invoiceItem->quantity) {
                throw ValidationException::withMessages([
                    "items.{$invoiceItemId}.quantity" =>
                    'DEBUG-A: Return quantity exceeds the quantity still eligible for return.',
                ]);
            }

            $raw = $requested['condition'];

            $condition = $raw instanceof ProductCondition ? $raw : ProductCondition::tryFrom($raw);

            if (! in_array($condition, [ProductCondition::SALEABLE, ProductCondition::DAMAGED], true)) {
                throw ValidationException::withMessages([
                    "items.{$invoiceItemId}.condition" => 'Condition must be saleable or damaged.',
                ]);
            }
        }
    }

    public function approve(User $user, SalesReturn $salesReturn, array $data)
    {
        $items = $salesReturn->items()->orderBy('product_id')->lockForUpdate()->get();

        if ($items->isEmpty()) {
            throw ValidationException::withMessages([
                'return' => 'A return must contain at least one item.',
            ]);
        }

        return DB::transaction(function () use ($data, $items, $salesReturn, $user): SalesReturn {
            $salesReturn = SalesReturn::query()->lockForUpdate()->findOrFail($salesReturn->getKey());

            $invoice = $salesReturn->invoice()->lockForUpdate()->findOrFail($salesReturn->invoice_id);

            $items = $salesReturn->items()->orderBy('invoice_item_id')->lockForUpdate()->get();

            $invoiceItemIds = $items->pluck('invoice_item_id')->unique()->sort()->values();

            $invoiceItems = $invoice->items()->whereIn('id', $invoiceItemIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            $this->validateQuantityNConditionForApproval($items->keyBy('invoice_item_id'), $invoiceItems);

            [$debtReductionAmount, $customerCreditAmount] = $this->getDebtReductionAndCredit($salesReturn);

            $validItems = collect($items)->filter(fn($item) => $item->restock_quantity > 0);

            $damagedItems = collect($items)->filter(fn($item) => $item->damaged_quantity > 0);

            if ($damagedItems->isNotEmpty()) {
                app(RecordDamagedProducts::class)->handle($damagedItems, $user, $salesReturn);
            }

            if ($validItems->isNotEmpty()) {
                $movementData = $validItems->map(fn($item) => [
                    'product_id' => $item->product_id,
                    'quantity'   => $item->restock_quantity,
                ])->all();

                $this->recordStockMovement->handle($user, StockMovementItem::collect($movementData), StockMovementType::CustomerReturn, $salesReturn);
            }

            $salesReturn->update([
                'status' => SalesReturnStatus::APPROVED,
                'approved_by' => $user->id,
                'approved_at' => now(),
                'approval_note' => $data['note'] ?? null,
                'debt_reduction_amount' => $debtReductionAmount,
                'customer_credit_amount' => $customerCreditAmount,
            ]);

            foreach ($salesReturn->items as $returnItem) {
                $invoice_item = InvoiceItem::query()->whereKey($returnItem->invoice_item_id)->lockForUpdate()->firstOrFail();

                $remainingQuantity = $invoice_item->quantity;

                if ($returnItem->quantity > $remainingQuantity) {
                    throw ValidationException::withMessages([
                        'items' => [
                            'The returned quantity exceeds the quantity remaining on the invoice.',
                        ],
                    ]);
                }

                $invoice_item->decrement('quantity', $returnItem->quantity);
                $invoice_item->increment('returned_quantity', $returnItem->quantity);
            }
            $salesReturn->invoice->calculateTotals();

            return $salesReturn->fresh()->load('items', 'invoice');
        });
    }

    private function getDebtReductionAndCredit(SalesReturn $salesReturn)
    {
        $invoice = $salesReturn->invoice;

        $previousDebtReductions = SalesReturn::query()->where('invoice_id', $invoice->id)->where('status', SalesReturnStatus::APPROVED)->sum('debt_reduction_amount');

        $outstandingDebt = max(0, $invoice->total_amount - $invoice->total_amount_paid - $previousDebtReductions);
        $totalAmount = $this->getTotalAmout($salesReturn, $salesReturn->items->keyBy("invoice_item_id"), $invoice->items->keyBy('id'));
        $debtReduction = min($totalAmount, $outstandingDebt);
        $customerCredit = $totalAmount - $debtReduction;

        return [$debtReduction, $customerCredit];
    }

    public function getTotalAmout(SalesReturn $return, Collection $items, Collection $invoiceItems): int
    {
        $totalAmount = 0;

        foreach ($items as $item) {
            $invoiceItem = $invoiceItems->get($item->invoice_item_id);

            $condition = $item->condition instanceof ProductCondition ? $item->condition : ProductCondition::tryFrom((string) $item->condition);

            $validConditionQuantities = match ($condition) {
                ProductCondition::SALEABLE => $item->restock_quantity === $item->quantity && $item->damaged_quantity === 0,

                ProductCondition::DAMAGED => $item->restock_quantity === 0 && $item->damaged_quantity === $item->quantity,

                default => false,
            };

            if (! $validConditionQuantities) {
                throw ValidationException::withMessages([
                    'return' => 'The item condition does not match its restock quantities.',
                ]);
            }

            $otherReservedQuantity = SalesReturnItem::query()
                ->where('invoice_item_id', $item->invoice_item_id)
                ->where('sales_return_id', '!=', $return->id)
                ->whereHas('salesReturn', function ($query) {
                    $query->whereIn('status', [
                        SalesReturnStatus::PENDING,
                        SalesReturnStatus::APPROVED,
                    ]);
                })
                ->sum('quantity');

            if ($otherReservedQuantity + $item->quantity > ($invoiceItem->quantity + $invoiceItem->returned_quantity)) {
                throw ValidationException::withMessages([
                    'return' => 'The return exceeds the quantity still eligible for return.',
                ]);
            }

            if (
                $item->unit_price < 0 ||
                $item->subtotal !== $item->quantity * $item->unit_price
            ) {
                throw ValidationException::withMessages([
                    'return' => 'The return contains an invalid item amount.',
                ]);
            }

            $totalAmount += $item->subtotal;
        }

        if ($totalAmount !== $return->total_amount) {
            throw ValidationException::withMessages([
                'return' => 'The return total does not match its items.',
            ]);
        }

        return $totalAmount;
    }
}
