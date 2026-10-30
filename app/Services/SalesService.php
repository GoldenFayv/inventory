<?php

namespace App\Services;

use App\Actions\AttachItemsToInvoice;
use App\Actions\CreatePayment;
use App\Actions\GetInvoice;
use App\Actions\RecordStockMovement;
use App\DataTransferObjects\RecordSalePayload;
use App\DataTransferObjects\StockMovementItem;
use App\DataTransferObjects\UpdateSalePayload;
use App\Enum\StockMovementType;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\SalesReturn;
use App\Models\User;
use App\Services\SalesServiceValidator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalesService
{
    public function __construct(public SalesServiceValidator $salesService, public RecordStockMovement $recordStockMovement, public GetInvoice $getInvoice, public AttachItemsToInvoice $attachItemsToInvoice, public CreatePayment $createPayment) {}
    public function recordSales(User $user, RecordSalePayload $data): Invoice
    {
        $store = $user->active_store;

        return DB::transaction(function () use ($user, $store, $data): Invoice {
            $itemsByProductId = collect($data->items)->keyBy('productId');

            $productIds = $itemsByProductId->keys()->sort()->values();

            $products = Product::query()->where('store_id', $store->id)->whereIn('id', $productIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            $validated = $this->salesService->validateSales($products, $itemsByProductId, (array) $data);

            $invoice = $this->getInvoice->handle($user, $validated);

            $items = $this->attachItemsToInvoice->handle($invoice, $validated['prepared_items']);

            $this->recordStockMovement->handle($user, StockMovementItem::collect($items->toArray()), StockMovementType::Sale);

            if ($validated['amount'] > 0) {
                $this->createPayment->handle($invoice, $validated['amount'], $validated['payment_method']);
            }

            return $invoice->calculateTotals()->load(['items.product', 'payments']);
        });
    }

    /**
     * Summary of updateSales
     * @param Invoice $invoice
     * @param User $user
     *  @param  UpdateSalePayload  $data
     * @return Invoice
     */
    public function updateSales(Invoice $invoice, User $user, UpdateSalePayload $data): Invoice
    {
        $before = [];
        $invoice = DB::transaction(function () use ($user, $invoice, $data, &$before): Invoice {
            $invoice = Invoice::where('store_id', $user->active_store_id)->lockForUpdate()->findOrFail($invoice->getKey());

            if (! empty($data->items) && SalesReturn::query()->where('invoice_id', $invoice->id)->exists()) {
                throw ValidationException::withMessages([
                    'items' => ['Invoice items cannot be changed after a sales return has been requested.'],
                ]);
            }

            $before = $this->getSaleSnapshot($invoice);

            $store = $user->active_store;

            $itemsByProductId = collect($data->items)->keyBy('productId');

            $productIds = $itemsByProductId->keys()->sort()->values();

            $products = Product::query()->where('store_id', $store->id)->whereIn('id', $productIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            $validated = $this->salesService->validateSales($products, $itemsByProductId, (array) $data);

            if (\count($validated['prepared_items'])) {
                $items = $this->attachItemsToInvoice->handle($invoice, $validated['prepared_items']);

                $this->recordStockMovement->handle($user, StockMovementItem::collect($items->toArray()), StockMovementType::Sale);
            }

            if ($validated['amount'] > 0) {
                $this->createPayment->handle($invoice, $validated['amount'], $validated['payment_method']);
            }

            return $invoice->calculateTotals()->load('items.product', 'payments');
        });

        return $invoice;
    }

    public function getSaleSnapshot(Invoice $invoice): array
    {
        $invoice->loadMissing(['items', 'payments']);

        return [
            'total_amount' => $invoice->total_amount,
            'total_amount_paid' => $invoice->total_amount_paid,
            'items' => $invoice->items->map(fn($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ])->values()->all(),
            'payments' => $invoice->payments->map(fn($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
            ])->values()->all(),
        ];
    }
}
