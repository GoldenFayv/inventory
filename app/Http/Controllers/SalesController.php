<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\RecordSalePayload;
use App\DataTransferObjects\UpdateSalePayload;
use App\Events\SaleRecorded;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Services\SalesService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SalesController extends Controller
{
    public function __construct(public SalesService $salesService) {}
    public function store(StoreSaleRequest $request): InvoiceResource
    {
        $invoice = $this->salesService->recordSales($request->user(), RecordSalePayload::fromArray($request->validated()));

        SaleRecorded::dispatch($invoice);

        return new InvoiceResource($invoice);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $invoices = Invoice::filterPeriod($request->all())->credits($request->boolean('credit'))->filter($request->query())->search($request->query('search'))->with(["items", "generatedBy", "payments"])->where('store_id', $user->active_store_id)->latest()->paginate($request->input("per_page", 10));

        return InvoiceResource::collection($invoices);
    }

    public function show(Request $request, string $invoiceId): InvoiceResource
    {
        $user = $request->user();

        $invoice = Invoice::with(["items.product", "generatedBy", "payments", "store"])->where('store_id', $user->active_store_id)->findOrFail($invoiceId);

        return new InvoiceResource($invoice);
    }

    public function update(UpdateSaleRequest $request, string $invoiceId)
    {
        $user = $request->user();

        $invoice = $this->salesService->updateSales($invoiceId, $user,  UpdateSalePayload::fromArray($request->validated()));

        return new InvoiceResource($invoice);
    }
}
