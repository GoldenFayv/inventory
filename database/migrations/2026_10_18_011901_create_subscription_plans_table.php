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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('description');
            // $table->unsignedBigInteger('price')->default(0);
            // $table->string('currency', 3)->default('NGN');
            // $table->string('billing_interval')->nullable(); // monthly, yearly
            $table->boolean("for_free_trial")->default(false);
            // $table->integer("trial_length")->default(14);

            $table->foreignUuid("store_id")->nullable()->constrained("stores")->cascadeOnDelete()->cascadeOnUpdate();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
