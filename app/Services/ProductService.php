<?php

namespace App\Services;

use App\Actions\CreateProduct;
use App\Actions\RecordStockMovement;
use App\Actions\UpdateProduct;
use App\DataTransferObjects\StockMovementItem;
use App\Enum\StockMovementType;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProductService
{
    /**
     * Create a new class instance.
     */
    public function __construct(public CreateProduct $createProduct, public RecordStockMovement $recordStockMovement, public UpdateProduct $updateProduct)
    {
        //
    }

    public function create(User $user, array $data): Product
    {
        return DB::transaction(function () use ($user, $data): Product {

            $product = $this->createProduct->handle($user, $data);

            $items = [
                [
                    "product_id" => $product->getKey(),
                    "quantity" => $data['opening_quantity']
                ]
            ];

            $this->recordStockMovement->handle($user, StockMovementItem::collect($items),  StockMovementType::OpeningStock);

            return $product->refresh();
        });
    }

    public function update(User $user, Product $product, array $data): Product
    {
        $this->updateProduct->handle($user, $product, $data);

        return $product->refresh();
    }

    /**
     * @param  Collection<string, StockMovementItem>  $items
     */
    public function restock(User $user, Collection $items): void
    {
        $this->recordStockMovement->handle($user, $items, StockMovementType::StockReceived);
    }
}
