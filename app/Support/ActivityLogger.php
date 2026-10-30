<?php

namespace App\Support;

use App\Enum\ActivityLoggerEvent;
use App\Models\Store;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Activity;

class ActivityLogger
{
    /**
     * Attributes that should never appear in audit snapshots.
     */
    private array $excludedAttributes = [
        'id',
        'password',
        'remember_token',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function log(ActivityLoggerEvent $event, Model $causer, Store $store, ?Model $subject = null, array $properties = [], ?array $attributeChanges = null): Activity
    {
        $attributeChanges ??= $subject && in_array($event, [ActivityLoggerEvent::PRODUCT_UPDATED, ActivityLoggerEvent::SALE_UPDATED], true) ? $this->extractChanges($subject) : [];
        /**
         * @var Activity $activity
         */
        $activity = activity($event->logName())
            ->causedBy($causer)
            ->performedOn($subject)
            ->event($event->value)
            ->withProperties($properties)
            ->log($event->description());

        $activity->forceFill([
            'store_id' => $store->getKey(),
            'attribute_changes' => $attributeChanges,
        ])->save();

        return $activity;
    }

    /**
     * Extract attributes changed during the last successful model save.
     */
    private function extractChanges(Model $subject): array
    {
        $changes = $subject->getChanges();
        $previous = $subject->getPrevious();
        $current = $subject->getAttributes();

        $attributeChanges = [];

        foreach ($changes as $attribute => $newValue) {
            if (in_array($attribute, $this->excludedAttributes, true)) {
                continue;
            }

            $oldValue = $previous[$attribute] ?? null;

            // Ignore attributes whose values did not actually change.
            if ($oldValue === $newValue) {
                continue;
            }

            $attributeChanges[$attribute] = [
                'old' => $oldValue,
                'new' => $current[$attribute] ?? $newValue,
            ];
        }

        return $attributeChanges;
    }
}
