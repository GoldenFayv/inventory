<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable('name', 'latitude', 'longitude', 'lga_id')]
class Ward extends Model
{
    use HasUuids;
    //
}
