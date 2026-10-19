<?php

namespace App\Http\Controllers;

use App\Actions\CreateProduct;
use App\Actions\RecordStockMovement;
use App\Actions\UpdateProduct;
use App\DataTransferObjects\StockMovementItem;
use App\Enum\StockMovementType;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $products = Product::stockStatus($request->input("stock"))->with('media')->search($request->input("search"))->where('store_id', $user->active_store_id)->latest()->paginate(($request->input("per_page", 10)));

        return ProductResource::collection($products);
    }

    public function store(Request $request, CreateProduct $createProduct, RecordStockMovement $stockMovment): ProductResource
    {
        return DB::transaction(function () use ($createProduct, $stockMovment, $request): ProductResource {

            $product = $createProduct->handle($request->user(), $request->all());

            if ($request->hasFile("images")) {
                $product->uploadFiles($request->file("images"), "image");
            }

            $items = [
                [
                    "product_id" => $product->id,
                    "quantity" => $request->input('opening_quantity')
                ]
            ];

            $stockMovment->handle($request->user(), StockMovementItem::collect($items),  StockMovementType::OpeningStock);

            return new ProductResource($product);
        });
    }

    public function show(Request $request, string $productId): ProductResource
    {
        $user = $request->user();

        $product = Product::with('media')->where('store_id', $user->active_store_id)->findOrFail($productId);

        return new ProductResource($product);
    }

    public function update(Request $request, string $productId, UpdateProduct $updateProduct): ProductResource
    {
        $user = $request->user();

        $product = Product::where('store_id', $user->active_store_id)->findOrFail($productId);

        $updateProduct->handle($user, $product, $request->all());

        if ($request->hasFile("images")) {
            $product->uploadFiles($request->file("images"), "image");
        }

        return new ProductResource($product);
    }
}
