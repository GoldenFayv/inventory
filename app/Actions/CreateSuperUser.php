<?php

namespace App\Actions;

class CreateSuperUser
{
    public function handle()
    {
        $data = [
            "first_name" => "Favour",
            "last_name" => "Golden",
            "email" => "favour.e2002@tallyhouse.com",
            "password" => 'Pa$$w0rd!',
            "phone" => "09034568645"
        ];

        $user = app(CreateUser::class)->handle($data);

        $user->is_super_user = true;
        $user->update();
    }
}
