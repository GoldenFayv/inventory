<?php

namespace App\Actions;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UpdateProduct
{
    private const MAX_IMAGES = 3;

    public function handle(User $user, Product $product, array $data): Product
    {
        abort_unless($product->store_id === $user->active_store_id, 404);

        $validated = Validator::make($data, [
            "sku" => ["sometimes", "nullable", Rule::unique("products", "sku")
                ->where("store_id", $user->active_store_id)
                ->ignore($product->id)],
            "name" => ["sometimes", "required", Rule::unique("products", "name")
                ->where("store_id", $user->active_store_id)
                ->ignore($product->id)],
            "selling_price" => ["sometimes", "required", "numeric", "min:0"],
            "cost_price" => ["sometimes", "required", "numeric", "min:0"],
            "low_stock_threshold" => ["sometimes", "integer", "min:0"],
            "is_active" => ["sometimes", "boolean"],
            "images" => ["sometimes", "array", "max:" . self::MAX_IMAGES],
            "images.*" => ["file", "image", "mimes:jpg,jpeg,png,webp", "max:5120"],
            "remove_media_ids" => ["sometimes", "array"],
            "remove_media_ids.*" => ["uuid"],
        ], [
            "sku.unique" => "A product with this SKU already exists in your store.",
            "name.required" => "Enter a product name.",
            "name.unique" => "You already have a product with this name.",
            "selling_price.required" => "Enter a selling price.",
            "selling_price.numeric" => "Selling price must be a number.",
            "cost_price.required" => "Enter a cost price.",
            "cost_price.numeric" => "Cost price must be a number.",
            "images.array" => "Images must be sent as a list of files.",
            "images.max" => "You can upload at most :max images.",
            "images.*.file" => "Each image must be a valid file.",
            "images.*.image" => "Each upload must be an image.",
            "images.*.mimes" => "Images must be JPG, PNG or WebP.",
            "images.*.max" => "Each image must be 5 MB or smaller.",
        ], [
            "selling_price" => "selling price",
            "cost_price" => "cost price",
        ])->validate();

        $newImages = $validated["images"] ?? [];

        // Only media that belongs to this product's image collection can be removed
        $toRemove = $product->getMedia("image")
            ->whereIn("id", $validated["remove_media_ids"] ?? []);

        $finalCount = $product->getMedia("image")->count() - $toRemove->count() + count($newImages);

        if ($finalCount > self::MAX_IMAGES) {
            throw ValidationException::withMessages([
                "images" => "A product can have at most " . self::MAX_IMAGES . " images.",
            ]);
        }

        return DB::transaction(function () use ($product, $validated, $toRemove, $newImages) {
            $product->update(collect($validated)->except(["images", "remove_media_ids"])->all());

            $toRemove->each->delete();

            return $product->load("media");
        });
    }
}
