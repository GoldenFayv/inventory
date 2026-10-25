<?php

namespace App\Models\Concerns;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

trait ForPeriods
{
    public function scopeForPeriod(Builder $query, array $filters): Builder
    {
        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;
        $date = $filters['date'] ?? null;
        if (empty($from) && empty($to)) {
            $start = $date ? Carbon::parse($date)->startOfDay() : today();
            return $query->whereBetween('created_at', [$start, $start->copy()->endOfDay()]);
        }

        $start = Carbon::parse($from ?? $to)->startOfDay();
        $end = Carbon::parse($to ?? $from)->endOfDay();
        logger("Filters", [$start, $end]);
        return $query->whereBetween('created_at', [$start, $end]);

        // Default to today

    }
}
