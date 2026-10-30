<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('event')->nullable()->index();
            $table->text('description');
            $table->foreignUuid('store_id')->nullable()->constrained('stores')->nullOnDelete();
            $table->nullableUuidMorphs('subject', 'subject');
            $table->nullableUuidMorphs('causer', 'causer');
            $table->string('log_name')->nullable();
            $table->json('attribute_changes')->nullable();
            $table->json('properties')->nullable();
            $table->timestamps();
        });
    }
};
