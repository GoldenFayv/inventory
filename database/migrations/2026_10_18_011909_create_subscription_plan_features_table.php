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
        Schema::create('subscription_plan_features', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subscription_plan_id')->constrained('subscription_plans')->cascadeOnDelete();
            $table->boolean('is_enabled')->default(true);

            // Null means unlimited or no numeric limit applies.
            $table->unsignedInteger('feature_limit')->nullable();
            $table->string('feature');


            $table->timestamps();

            $table->unique(['subscription_plan_id', 'feature']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_features');
    }
};
