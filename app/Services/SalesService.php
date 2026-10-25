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
            
            return $invoice->calculateTotals()->load('items.product', 'payments');
        });
    }

    /**
     * Summary of updateSales
     * @param string $invoiceId
     * @param User $user
     *  @param  UpdateSalePayload  $data
     * @return Invoice
     */
    public function updateSales(string $invoiceId, User $user, UpdateSalePayload $data): Invoice
    {
        return DB::transaction(function () use ($user, $invoiceId, $data): Invoice {
            $invoice = Invoice::where('store_id', $user->active_store_id)->lockForUpdate()->findOrFail($invoiceId);

            if (! empty($data->items) && SalesReturn::query()->where('invoice_id', $invoice->id)->exists()) {
                throw ValidationException::withMessages([
                    'items' => ['Invoice items cannot be changed after a sales return has been requested.'],
                ]);
            }

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
    }
}
