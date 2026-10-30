<?php

namespace App\Actions;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CreateProduct
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function handle(User $user, array $data): Product
    {
        $validator = Validator::make($data, [
            "sku" => ["sometimes", Rule::unique("products", "sku")->where("store_id", $user->active_store_id)],
            "name" => ["required", Rule::unique("products", "name")->where("store_id", $user->active_store_id)],
            "selling_price" => ["required", "numeric", "min:0"],
            "cost_price" => ["required", "numeric", "min:0"],
            "opening_quantity" => ["sometimes", "integer", "min:1"],
            "images" => ["sometimes", "array", "max:3"],
            "images.*" => ["file", "image", "mimes:jpg,jpeg,png,webp", "max:2048"],
            "low_stock_threshold" => ["required", "min:1", "integer"]
        ], [
            "sku.unique" => "A product with this SKU already exists in your store.",
            "name.required" => "Enter a product name.",
            "name.unique" => "You already have a product with this name.",
            "selling_price.required" => "Enter a selling price.",
            "selling_price.numeric" => "Selling price must be a number.",
            "cost_price.required" => "Enter a cost price.",
            "cost_price.numeric" => "Cost price must be a number.",
            "opening_quantity.integer" => "Opening quantity must be a whole number.", /*The increment is triggered by stock movement' boot handle*/
            "images.array" => "Images must be sent as a list of files.",
            "images.max" => "You can upload at most :max images.",
            "images.*.file" => "Each image must be a valid file.",
            "images.*.image" => "Each upload must be an image.",
            "images.*.mimes" => "Images must be JPG, PNG or WebP.",
            "images.*.max" => "Each image must be 5 MB or smaller.",
        ], [
            // optional: friendlier names for the default messages
            "selling_price" => "selling price",
            "cost_price" => "cost price",
            'images.*.uploaded' => 'Each image must be smaller than 2048KB.',
            'images.*.max'      => 'Each image must be 2048KB or less.',
        ]);

        $validated = $validator->validate();
        $validated['sku'] ??= generateSku();

        return $user->active_store->products()->create($validated)->load("media");
    }
}
