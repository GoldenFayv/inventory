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
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference')->unique();
            $table->foreignUuid('store_id')->constrained('stores')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignUuid('generated_by')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->integer('total_amount')->default(0);
            $table->integer('total_amount_paid')->default(0);
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_address')->nullable();
            $table->foreignUuid('customer_lga_id')->nullable()->constrained('local_govt_areas')->cascadeOnDelete()->cascadeOnUpdate();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
