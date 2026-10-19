<?php

namespace App\Models\Concerns;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use InvalidArgumentException;

trait Filterable
{
    /**
     * Usage: Model::filter($request->query())
     *
     * Define on the model:
     *
     *   protected array $filterable = [
     *       'status'      => 'exact',
     *       'category_id' => 'in',
     *       'is_active'   => 'boolean',
     *       'price'       => 'range',                       // price[min], price[max]
     *       'created_at'  => 'date_range',                  // created_at[from], created_at[to]
     *       'category'    => ['in', 'category.id'],         // [type, column], column may be a relation
     *       'vendor'      => ['exact', 'vendor.user.name'],
     *   ];
     *
     * Empty values (null, '', []) are skipped. Unknown keys are ignored.
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        foreach ($this->filterable ?? [] as $key => $rule) {
            if (! array_key_exists($key, $filters)) {
                continue;
            }

            $value = $filters[$key];

            if ($value === null || $value === '' || $value === []) {
                continue;
            }

            [$type, $column] = is_array($rule) ? [$rule[0], $rule[1] ?? $key] : [$rule, $key];

            if ($type === 'scope') {
                // Delegates to a model scope, e.g. 'payment_status' => scopePaymentStatus()
                $query->{Str::camel($column)}($value);

                continue;
            }

            $this->applyFilter($query, $column, $type, $value);
        }

        return $query;
    }

    protected function applyFilter(Builder $query, string $column, string $type, mixed $value): void
    {
        if (str_contains($column, '.')) {
            // Relation column, e.g. "category.id" or "vendor.user.name"
            $pos = strrpos($column, '.');
            $relation = substr($column, 0, $pos);
            $field = substr($column, $pos + 1);

            $query->whereHas(
                $relation,
                fn(Builder $r) => $this->applyCondition($r, $r->qualifyColumn($field), $type, $value)
            );

            return;
        }

        $this->applyCondition($query, $this->qualifyColumn($column), $type, $value);
    }

    protected function applyCondition(Builder $query, string $column, string $type, mixed $value): void
    {
        match ($type) {
            'exact'      => $query->where($column, $value),
            'in'         => $query->whereIn($column, $this->toList($value)),
            'boolean'    => $query->where($column, filter_var($value, FILTER_VALIDATE_BOOLEAN)),
            'range'      => $this->applyRange($query, $column, $value, dates: false),
            'date_range' => $this->applyRange($query, $column, $value, dates: true),
            'money_range' => $this->applyRange($query, $column, array_map(fn(mixed $v): mixed => $v === null || $v === '' ? $v : toKobo($v), Arr::wrap($value)), dates: false,),
            default      => throw new InvalidArgumentException("Unknown filter type [{$type}]."),
        };
    }

    protected function applyRange(Builder $query, string $column, mixed $value, bool $dates): void
    {
        $value = Arr::wrap($value);

        $from = $value['from'] ?? $value['min'] ?? null;
        $to   = $value['to'] ?? $value['max'] ?? null;

        $method = $dates ? 'whereDate' : 'where';

        if ($from !== null && $from !== '') {
            $query->{$method}($column, '>=', $from);
        }

        if ($to !== null && $to !== '') {
            $query->{$method}($column, '<=', $to);
        }
    }

    /**
     * Accepts [1, 2], "1,2" or a single value.
     */
    protected function toList(mixed $value): array
    {
        return is_string($value)
            ? array_filter(explode(',', $value), fn($v) => $v !== '')
            : Arr::wrap($value);
    }

public function scopeFilterPeriod(Builder $query, array $filters): Builder
{
    $from = $filters['from'] ?? null;
    $to = $filters['to'] ?? null;

    // If both keys are missing, skip filtering completely
    if (empty($from) && empty($to)) {
        return $query;
    }

    // If only one key is present, mirror it to represent a single specific date
    $start = Carbon::parse($from ?? $to)->startOfDay();
    $end = Carbon::parse($to ?? $from)->endOfDay();

    return $query->whereBetween('created_at', [$start, $end]);
}


    public function scopePaymentStatus(
        Builder $query,
        string $status
    ): Builder {
        return match ($status) {
            'paid' => $query->whereColumn(
                'total_amount_paid',
                '>=',
                'total_amount'
            ),

            'partial' => $query
                ->where('total_amount_paid', '>', 0)
                ->whereColumn(
                    'total_amount_paid',
                    '<',
                    'total_amount'
                ),

            'unpaid' => $query
                ->where('total_amount_paid', '<=', 0)
                ->whereColumn(
                    'total_amount',
                    '>',
                    'total_amount_paid'
                ),

            default => $query,
        };
    }
}
