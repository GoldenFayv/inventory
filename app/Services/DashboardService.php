<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;

class DashboardService
{
    public function summary(User $user, array $filters)
    {
        $store = $user->active_store;

        $sales = Invoice::query()
            ->where('store_id', $store->id)
            ->forPeriod($filters)
            ->sum('total_amount');

        $moneyReceived = Payment::query()
            ->whereHas(
                'invoice',
                fn($query) =>
                $query->where('store_id', $store->id)
            )
            ->forPeriod($filters)
            ->sum('payments.amount');

        $outstandingCredit = Invoice::query()
            ->where('store_id', $store->id)
            ->whereColumn("total_amount_paid", "<", "total_amount")
            ->selectRaw(
                'COALESCE(SUM(total_amount - total_amount_paid), 0) AS balance'
            )
            ->value('balance');

        $products = Product::query()
            ->where('store_id', $store->id)
            ->where('is_active', true);

        $stockValue = (clone $products)
            ->selectRaw(
                'COALESCE(SUM(quantity * cost_price), 0) AS value'
            )
            ->value('value');

        $totalProducts = (clone $products)->count();

        $lowStockCount = (clone $products)
            ->where('quantity', '>', 0)
            ->whereColumn('quantity', '<=', 'low_stock_threshold')
            ->count();

        $outOfStockCount = (clone $products)
            ->where('quantity', '<=', 0)
            ->count();

        return [
            // 'period' => [
            //     "from" => $start->format("Y-m-d"),
            //     "to" => $end->format("Y-m-d")
            // ],
            'sales' => (int) toNaira($sales),
            'money_received' => (int) toNaira($moneyReceived),
            'outstanding_credit' => (int) toNaira($outstandingCredit),
            'stock_value' => (int) toNaira($stockValue),
            'total_products' => $totalProducts,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
        ];
    }
}
