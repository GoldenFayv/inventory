<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;

class Media extends BaseMedia
{
    use HasUuids;
    protected static function booted(): void
    {
        static::creating(function (Media $media) {
            $media->store_id ??= $media->model?->store_id;
        });
    }

    public function Url(): Attribute
    {
        return Attribute::make(
            fn() => $this->getUrl('image')
        );
    }
}
