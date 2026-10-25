<?php

namespace Database\Seeders;

use App\Actions\CreateSuperUser;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(CreateSuperUser::class)->handle();
    }
}
