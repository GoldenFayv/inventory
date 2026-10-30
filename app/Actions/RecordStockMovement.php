<?php

namespace App\Actions;

use App\DataTransferObjects\StockMovementItem;
use App\Enum\StockMovementType;
use App\Events\StockMovementRecorded;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\StockMovementValidator;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RecordStockMovement
{
    public function __construct(private StockMovementValidator $validator) {}

    /**
     * @param  Collection<string, StockMovementItem>  $items
     * @return Collection<int, StockMovement>
     */
    public function handle(User $user, Collection $items, StockMovementType $type, ?Model $reference = null): Collection
    {
        $storeId = $user->active_store_id;

        throw_unless($storeId, AuthorizationException::class, 'No active store selected.');

        $items = collect($items)->values();

        $this->validator->validateItems($items);

        return DB::transaction(function () use ($user, $items, $type, $storeId, $reference): Collection {
            $products = Product::where('store_id', $storeId)
                ->whereIn('id', $items->pluck('productId'))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $this->validator->ensureProductsExist($items, $products);
            $this->validator->ensureStockRules($storeId, $items, $type);

            $rows = $items->map(fn(StockMovementItem $item): array => [
                'product_id'    => $item->productId,
                'user_id'       => $user->id,
                'store_id'      => $storeId,
                'movement_type' => $type,
                'quantity'      => $type->signedQuantity($item->quantity),
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
            ]);

            $movements = $user->stock_movements()->createMany($rows);

            StockMovementRecorded::dispatch($user, $movements);

            return $movements;
        });
    }
}
