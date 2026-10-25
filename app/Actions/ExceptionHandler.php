<?php

namespace App\Actions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class ExceptionHandler
{
    public static function register(Exceptions $exceptions): void
    {
        $exceptions->render(fn(AuthenticationException $e, Request $request): JsonResponse|null => self::json($request, $e->getMessage(), 401));

        $exceptions->render(fn(AuthorizationException $e, Request $request): JsonResponse|null => self::json($request, $e->getMessage() ?: 'Access denied', 403));
        $exceptions->render(fn(ConnectionException $e, Request $request): JsonResponse|null => self::json($request, 'Connection error', 500));

        // $exceptions->render(fn(ModelNotFoundException|NotFoundHttpException $e, Request $request): JsonResponse|null => self::json($request, 'Resource not found', 404));

        // $exceptions->render(fn(ValidationException $e, Request $request): JsonResponse|null => self::json($request, 'Validation failed', 422, ['errors' => $e->errors()]));

        $exceptions->render(fn(PermissionDoesNotExist $e, Request $request): JsonResponse|null => self::json($request, 'Permission does not exist!', 422));

        // abort(403, '...') and other HTTP exceptions thrown from middleware
        $exceptions->render(fn(HttpExceptionInterface $e, Request $request): JsonResponse|null => self::json($request, $e->getMessage() ?: 'Request failed', $e->getStatusCode()));

        $exceptions->render(function (\Throwable $e, Request $request): JsonResponse|null {
            if (config('app.debug')) {
                logger("Throwable", [$e]);
                return null; // let Laravel show the trace
            }

            return self::json($request, 'Server error', 500);
        });
    }

    private static function json(Request $request, string $message, int $status, array $extra = []): ?JsonResponse
    {
        if (! ($request->is('api/*') || $request->expectsJson())) {
            return null; // fall through to Laravel's default rendering
        }

        return response()->json(['message' => $message, ...$extra], $status);
    }
}
