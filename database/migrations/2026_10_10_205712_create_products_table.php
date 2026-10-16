<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('sku')->unique();
            $table->foreignUuid('store_id')->constrained('stores')->cascadeOnDelete()->cascadeOnUpdate();
            $table->integer('quantity')->default(0);
            $table->integer('selling_price');
            $table->integer('cost_price');
            $table->foreignUuid("parent_id")->nullable();
            $table->boolean("is_active")->default(true);
            $table->integer("low_stock_threshold")->default(5);
            $table->timestamps();

            $table->unique(['name', 'store_id']);
            $table->unique(['sku', 'store_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
