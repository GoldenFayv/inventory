<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\MorphTo;

class Setting extends MyBaseModel
{

    protected $fillable = [
        'setting_key',
        'settingable_type',
        'settingable_id',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    public function settingable(): MorphTo
    {
        return $this->morphTo();
    }
}
