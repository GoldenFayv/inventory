<?php

namespace App\Models;

use App\Models\Concerns\Filterable;
use App\Models\Concerns\ForPeriods;
use App\Models\Concerns\Searchable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

#[Fillable('store_id', 'generated_by', 'customer_name', 'customer_phone', 'customer_email', 'customer_address', 'customer_lga_id', 'total_amount', 'total_amount_paid', 'reference')]
class Invoice extends Model
{
    use HasUuids, Searchable, Filterable, ForPeriods;

    protected array $searchable = ['reference', 'customer_email', 'customer_name', 'customer_phone'];
    protected array $filterable = [
        'generated_by'      => 'in',
        'customer_lga_id'   => 'in',
        'total_amount'      => 'money_range',   // total_amount[min], total_amount[max] in naira
        'total_amount_paid' => 'money_range',
        'created_at'        => 'date_range',    // created_at[from], created_at[to]
        'payment_status'    => 'scope',         // paid | credit
    ];

    public function scopeCredits(Builder $builder, bool $credit = false): Builder
    {
        return match ($credit) {
            true => $builder->whereColumn("total_amount", ">", "total_amount_paid"),
            false => $builder
        };
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    protected function TotalAmountPaid(): Attribute
    {
        return Attribute::make(
            set: toKobo(...)
        );
    }

    protected function TotalAmountPaidNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->total_amount_paid)
        );
    }

    protected function TotalAmountNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->total_amount)
        );
    }

    public function calculateTotals(): self
    {
        $this->attributes['total_amount'] = (int) $this->items()->sum(DB::raw('quantity * unit_price'));

        $this->attributes['total_amount_paid'] = (int) $this->payments()->sum('amount');

        $this->save();

        return $this->refresh();
    }
}
