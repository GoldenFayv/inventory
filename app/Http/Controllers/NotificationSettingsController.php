<?php

namespace App\Http\Controllers;

use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationSettingsController extends Controller
{
    public function __construct(private SettingService $settingService) {}

    public function show(Request $request): JsonResponse
    {
        $store = $request->user()->active_store;

        return response()->json(['data' => $store->getNotifications()]);
    }

    public function update(Request $request): JsonResponse
    {
        $store = $request->user()->active_store;

        $validated = $request->validate([
            'email' => ['sometimes', 'boolean'],
            'sms' => ['sometimes', 'boolean'],
            'whatsapp' => ['sometimes', 'boolean'],
        ]);

        return response()->json([
            'message' => 'Notification settings updated successfully.',
            'data' => $store->updateNotifications($validated),
        ]);
    }
}
