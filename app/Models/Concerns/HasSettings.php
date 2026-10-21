<?php

namespace App\Models\Concerns;



use App\Models\Setting;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Arr;

trait HasSettings
{
    public function settings(): MorphMany
    {
        return $this->morphMany(Setting::class, "settingable");
    }
    public function getSettings(string $key, array $default = []): array
    {
        $setting = $this->settings()->where('setting_key', $key)->first();

        return $setting ? ($setting->value ?? $default) : $default;
    }

    public function updateSettings(string $key, array $value): array
    {
        $setting = $this->settings()->updateOrCreate(
            ['setting_key' => $key],
            ['value' => $value],
        );

        return $setting->value ?? [];
    }

    public function getNotifications(): array
    {
        return $this->getSettings('notifications', [
            'email' => true,
            'sms' => false,
            'whatsapp' => false,
        ]);
    }

    public function updateNotifications(array $preferences): array
    {
        $current = $this->getNotifications();

        $updated = [...$current, ...Arr::only($preferences, [
            'email',
            'sms',
            'whatsapp',
        ])];

        return $this->updateSettings('notifications', $updated);
    }
}
