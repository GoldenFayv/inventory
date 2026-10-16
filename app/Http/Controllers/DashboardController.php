<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardRequest;
use App\Http\Resources\DashboardResource;
use App\Services\DashboardService;

class DashboardController extends Controller
{
    public function __construct(public DashboardService $dashboardService) {}

    public function __invoke(DashboardRequest $request)
    {
        $data = [
            "summary" => $this->dashboardService->summary($request->user(), $request->all())
        ];
        return new DashboardResource($data);
    }
}
