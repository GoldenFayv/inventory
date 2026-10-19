<?php

use App\Enum\SubscriptionPaymentEnum;
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
        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('subscription_id')->constrained('subscriptions')->restrictOnDelete()->cascadeOnUpdate();

            $table->string('provider')->nullable(); // e.g. paystack
            $table->string('reference')->nullable()->unique();

            $table->unsignedBigInteger('amount');
            $table->string('currency', 3)->default('NGN');

            $table->string('status')->default(SubscriptionPaymentEnum::PENDING); // pending, successful, failed

            $table->timestamp('paid_at')->nullable();
            $table->json('provider_payload')->nullable();

            $table->timestamps();

            $table->index(['subscription_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_payments');
    }
};
