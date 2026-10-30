<?php

namespace App\Http\Controllers\Products;

use App\Actions\UpdateProduct;
use App\Events\ProductCreated;
use App\Events\ProductUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(public ProductService $productService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $products = Product::stockStatus($request->input("stock"))->with('media')->search($request->input("search"))->where('store_id', $user->active_store_id)->latest()->paginate(($request->input("per_page", 10)));

        return ProductResource::collection($products);
    }

    public function store(Request $request): ProductResource
    {
        $user = $request->user();

        $product = $this->productService->create($user, $request->all());

        if ($request->hasFile("images") && $product) {
            $product->uploadFiles($request->file("images"), "image");
        }

        ProductCreated::dispatch($user, $product);

        return new ProductResource($product);
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

        $product = $this->productService->update($user, $product, $request->all());

        if ($request->hasFile("images") && $product) {
            $product->uploadFiles($request->file("images"), "image");
        }

        ProductUpdated::dispatch($user, $product);

        return new ProductResource($product);
    }
}
