<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class EmailVerificationController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $user = $request->user();
        /**
         * @var User $user
         */
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Your email address is already verified.',
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'A verification link has been sent to your email address.',
        ]);
    }

    public function verify(Request $request, string $id, string $hash): RedirectResponse
    {
        $frontendUrl = rtrim(
            (string) config('app.frontend_url'),
            '/',
        );

        if (! URL::hasValidSignature($request)) {
            return redirect()->away("$frontendUrl/email/verify?status=invalid",);
        }

        $user = User::find($id);

        if (! $user || ! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect()->away("$frontendUrl/email/verify?status=invalid",);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return redirect()->away($frontendUrl . '/email/verify?status=success');
    }
}
