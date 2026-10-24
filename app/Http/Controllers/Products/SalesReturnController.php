<?php

namespace App\Http\Controllers\Products;

use App\Actions\Products\RejectSalesReturn;
use App\Enum\FeatureEnum;
use App\Enum\SalesReturnStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewSalesReturnRequest;
use App\Http\Requests\StoreSalesReturnRequest;
use App\Http\Resources\SalesReturnResource;
use App\Models\Invoice;
use App\Models\SalesReturn;
use App\Models\Store;
use App\Models\User;
use App\Services\Products\SalesReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SalesReturnController extends Controller
{
    public function __construct(public SalesReturnService $salesReturnService, public RejectSalesReturn $rejectSalesReturn) {}

    public function store(StoreSalesReturnRequest $request, string $invoiceId): JsonResponse
    {
        $user = $request->user();

        $invoice = Invoice::where('store_id', $user->active_store_id)->findOrFail($invoiceId);
        $this->ensureFeature($user);
        $return = $this->salesReturnService->request($invoice, $user, $request->validated());

        return response()->json([
            'message' => 'Return request submitted successfully.',
            'data' => $return,
        ], 201);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $this->ensureFeature($user);

        $validated = $request->validate(['status' => ['nullable', 'in:pending,approved,rejected'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);

        $returns = SalesReturn::query()
            ->where('store_id', $user->active_store_id)
            ->when(
                $validated['status'] ?? null,
                fn($query, $status) => $query->where('status', $status),
            )->with(['invoice', 'requester', 'approver', 'items.product'])->latest()->paginate($validated['per_page'] ?? 10);

        return SalesReturnResource::collection($returns);
    }

    public function show(Request $request, string $returnId): SalesReturnResource
    {
        $user = $request->user();

        $this->ensureFeature($user);

        $return = SalesReturn::query()->where('store_id', $user->active_store_id)->with(['invoice', 'requester', 'approver', 'items.product'])->findOrFail($returnId);

        return new SalesReturnResource($return);
    }

    public function update(ReviewSalesReturnRequest $request, string $returnId): SalesReturnResource
    {
        $user = $request->user();

        $this->ensureFeature($user);

        $saleReturn = SalesReturn::whereKey($returnId)->whereStatus(SalesReturnStatus::PENDING)->whereStoreId($user->active_store_id)->firstOrFail();

        $return = match ($request->validated('action')) {
            "approved" => $this->salesReturnService->approve($user, $saleReturn, $request->validated()),
            "rejected" => $this->rejectSalesReturn->handle($user, $saleReturn->id, $saleReturn->invoice, $request->validated('note'))
        };

        return new SalesReturnResource($return);
    }

    private function ensureFeature(User $user): void
    {
        abort_if(! $user->active_store_id, 403, 'No active store selected.',);

        $store = Store::query()->findOrFail($user->active_store_id);

        abort_unless($store->hasFeature(FeatureEnum::SALES_RETURNS), 402, 'Your current plan does not include sales returns.',);
    }
}
