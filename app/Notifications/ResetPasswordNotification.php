<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $token, public array $channel = ['mail']) {}

    public function via(object $notifiable): array
    {
        return $this->channel;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        $resetUrl = "$frontendUrl/reset-password?"
            . http_build_query([
                'token' => $this->token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);

        return (new MailMessage)
            ->subject('Reset your TallyHouse password')
            ->greeting('Hello!')
            ->line('We received a request to reset your TallyHouse password.')
            ->action('Reset Password', $resetUrl)
            ->line('This link expires after 60 minutes.')
            ->line('If you did not request a password reset, you can safely ignore this email.');
    }
}
