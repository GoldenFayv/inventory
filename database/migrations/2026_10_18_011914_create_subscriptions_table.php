<?php

use App\Enum\SubscriptionStatus;
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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('store_id')->constrained('stores')->cascadeOnUpdate()->cascadeOnDelete();

            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('status')->default(SubscriptionStatus::PENDING);
            $table->foreignUuid('subscription_plan_price_id')->constrained('subscription_plan_prices')->restrictOnDelete()->cascadeOnUpdate();

            $table->string('billing_interval')->nullable();
            $table->unsignedBigInteger('price')->nullable();
            $table->string('currency', 3)->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->foreignUuid('subscription_plan_id')->constrained('subscription_plans')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamps();

            $table->index(['store_id', 'created_at']);
            $table->index(['store_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
