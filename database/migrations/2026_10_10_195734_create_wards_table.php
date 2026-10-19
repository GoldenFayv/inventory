<?php

use Database\Seeders\StateNLgaSeeder;
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
        Schema::create('wards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('longitude')->nullable();
            $table->string('latitude')->nullable();
            $table->foreignUuid('lga_id')->constrained('local_govt_areas')->cascadeOnDelete()->cascadeOnUpdate();
            $table->timestamps();

            $table->unique(['lga_id', 'name']);
        });
        if (!app()->environment('testing')) {
            app(StateNLgaSeeder::class)->run();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wards');
    }
};
