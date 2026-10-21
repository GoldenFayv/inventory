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
        Schema::create('notification_deliveries', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->foreignUuid("store_id")->constrained("stores")->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUuid("user_id")->constrained("users")->cascadeOnUpdate()->cascadeOnDelete();
            $table->string("event");
            $table->string("channel");
            $table->string("status");
            $table->string("provider_message_id");
            $table->string("error_message");
            $table->timestamp("sent_at")->nullable();
            $table->timestamp("delivered_at")->nullable();
            $table->timestamp("read_at")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_deliveries');
    }
};
