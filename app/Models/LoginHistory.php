<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable('reference_id', 'reference_type', 'user_agent', 'ip_address', 'logged_out_at', 'token')]
class LoginHistory extends Model
{
    use HasUuids;
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
