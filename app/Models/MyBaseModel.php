<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


abstract class MyBaseModel extends Model
{
    use HasFactory, HasUuids;

    protected static function newFactory(): ?Factory
    {
        $factory = 'Database\\Factories\\' . class_basename(static::class) . 'Factory';

        return class_exists($factory) ? $factory::new() : null;
    }
}
