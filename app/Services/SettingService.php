<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class SettingService
{
    public function get(Model $owner, string $key, array $default = []): array
    {
        $setting = $owner->settings()
            ->where('setting_key', $key)
            ->first();

        return $setting
            ? ($setting->value ?? $default)
            : $default;
    }

    public function update(Model $owner, string $key, array $value): array
    {
        $setting = $owner->settings()->updateOrCreate(
            ['setting_key' => $key],
            ['value' => $value],
        );

        return $setting->value ?? [];
    }

    public function getNotifications(Model $owner): array
    {
        return $this->get($owner, 'notifications', [
            'email' => true,
            'sms' => false,
            'whatsapp' => false,
        ]);
    }

    public function updateNotifications(Model $owner, array $preferences): array
    {
        $current = $this->getNotifications($owner);

        $updated = array_merge($current, Arr::only($preferences, [
            'email',
            'sms',
            'whatsapp',
        ]));

        return $this->update($owner, 'notifications', $updated);
    }
}
