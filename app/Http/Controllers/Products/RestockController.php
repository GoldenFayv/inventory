<?php

namespace App\Http\Controllers\Products;

use App\DataTransferObjects\StockMovementItem;
use App\Http\Controllers\Controller;
use App\Services\ProductService;
use Illuminate\Http\Request;

class RestockController extends Controller
{
    public function __construct(public ProductService $productService) {}
    public function store(Request $request)
    {
        $this->productService->restock($request->user(), StockMovementItem::collect($request->input('products')));

        return response()->json();
    }
}
