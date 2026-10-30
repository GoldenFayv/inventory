<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\Models\Activity;

class ActivityLog extends Activity
{
    use HasUuids;
    //
}
