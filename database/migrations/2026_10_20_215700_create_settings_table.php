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
        Schema::create('settings', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuidMorphs('settingable');

            $table->string('setting_key');
            $table->json('value')->nullable();

            $table->timestamps();

            $table->unique(
                ['settingable_type', 'settingable_id', 'setting_key'],
                'settings_owner_key_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
