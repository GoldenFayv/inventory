
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_return_items', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('sales_return_id')->constrained('sales_returns')->cascadeOnUpdate()->restrictOnDelete();

            $table->foreignUuid('invoice_item_id')->constrained('invoice_items')->cascadeOnUpdate()->restrictOnDelete();

            $table->foreignUuid('product_id')->constrained('products')->cascadeOnUpdate()->restrictOnDelete();

            $table->integer('quantity');
            $table->integer('unit_price');
            $table->integer('subtotal');

            // saleable or damaged
            $table->string('condition');
            $table->integer('restock_quantity')->default(0);
            $table->integer('damaged_quantity')->default(0);
            $table->string('reason')->nullable();

            $table->timestamps();

            $table->index(['invoice_item_id', 'sales_return_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_return_items');
    }
};
