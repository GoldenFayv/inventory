<?php

namespace App\Actions\Products;

use App\Actions\RecordStockMovement;
use App\DataTransferObjects\StockMovementItem;
use App\Enum\StockMovementType;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class RecordDamagedProducts
{
    public function __construct(public RecordStockMovement $recordStockMovement) {}

    public function handle(Collection $damagedItems, User $user, ?Model $reference = null)
    {
        if ($damagedItems->isNotEmpty()) {
            $movementData = $damagedItems->map(fn($item) => [
                'product_id' => $item->product_id,
                'quantity'   => $item->damaged_quantity,
                'unit_price' => $item->unit_price,
            ])->all();

            $this->recordStockMovement->handle($user, StockMovementItem::collect($movementData), StockMovementType::DamagedGoods, $reference);
        }
    }
}
