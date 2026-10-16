<?php

namespace App\Http\Controllers;

use App\Actions\UpdateProduct;
use App\Models\Product;
use Illuminate\Http\Request;

class SetProductStatusController extends Controller
{
    public function __invoke(Request $request, string $productId, UpdateProduct $updateProduct)
    {
        $user = $request->user();

        dispatch(function () use ($user, $updateProduct, $productId) {

            $product = Product::where('store_id', $user->active_store_id)->findOrFail($productId);

            $updateProduct->handle($user, $product, ["is_active" => !$product->is_active]);
        });

        return response()->json();
    }
}
