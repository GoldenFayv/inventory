<?php

use Illuminate\Support\Str;

if (!function_exists('mydd')) {
    function mydd(mixed ...$data): never
    {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }

        $payload = count($data) === 1 ? $data[0] : $data;

        $json = json_encode(
            $payload,
            JSON_PRETTY_PRINT
                | JSON_UNESCAPED_UNICODE
                | JSON_UNESCAPED_SLASHES
                | JSON_PARTIAL_OUTPUT_ON_ERROR
                | JSON_INVALID_UTF8_SUBSTITUTE
        );

        echo $json !== false
            ? $json
            : json_encode(['mydd_error' => json_last_error_msg()]);

        exit(1);
    }
}

if (!function_exists('generateSku')) {
    function generateSku(): string
    {
        return 'PRD-' . Str::upper(Str::random(10));
    }
}

if (!function_exists("toKobo")) {
    function toKobo(float $value)
    {
        return $value * 100;
    }
}

if (!function_exists("toNaira")) {
    function toNaira(int $value)
    {
        return $value / 100;
    }
}

if (! function_exists('generateReference')) {
    /**
     * e.g. SM-261014-K7QX2M9A
     */
    function generateReference(string $prefix = 'REF', int $length = 8): string
    {
        return sprintf(
            '%s-%s-%s',
            strtoupper($prefix),
            now()->format('ymd'),
            strtoupper(Str::random($length)),
        );
    }
}
