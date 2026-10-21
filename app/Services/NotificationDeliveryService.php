<?php

namespace App\Services;

use App\Models\NotificationDelivery;
use Illuminate\Support\Facades\Log;

class NotificationDeliveryService
{
    public function accepted(?string $deliveryId, ?string $providerMessageId = null): void
    {
        $delivery = $this->find($deliveryId);

        if (! $delivery) {
            return;
        }

        $delivery->update([
            'status' => 'accepted',
            'provider_message_id' => $providerMessageId,
            'sent_at' => now(),
            'error_message' => null,
        ]);
    }

    public function failed(?string $deliveryId, string $message): void
    {
        $delivery = $this->find($deliveryId);

        if (! $delivery) {
            return;
        }

        $delivery->update([
            'status' => 'failed',
            'error_message' => mb_substr($message, 0, 1000),
        ]);
    }

    private function find(?string $deliveryId): ?NotificationDelivery
    {
        if (! $deliveryId) {
            Log::warning('Notification delivery ID is missing.');

            return null;
        }

        return NotificationDelivery::find($deliveryId);
    }
}
