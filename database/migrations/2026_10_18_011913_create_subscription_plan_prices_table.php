
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plan_prices', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('subscription_plan_id')->constrained('subscription_plans')->cascadeOnUpdate()->cascadeOnDelete();

            $table->string('billing_interval'); // monthly, yearly
            $table->unsignedBigInteger('price');
            $table->string('currency', 3)->default('NGN');
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['subscription_plan_id', 'billing_interval']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_prices');
    }
};
