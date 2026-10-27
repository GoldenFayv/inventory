import { useState } from "react";
import { Mail, X, CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
import { emailVerificationService } from "./services/emailVerificationService";

interface EmailVerificationReminderProps {
  userId: string | number;
  email: string;
}

export default function EmailVerificationReminder({
  userId,
  email,
}: EmailVerificationReminderProps) {
  const storageKey = `tallyhouse-email-verification-dismissed-${userId}`;

  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(storageKey) === "true");
  
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function dismiss() {
    sessionStorage.setItem(storageKey, "true");
    setDismissed(true);
  }

  async function sendVerificationLink() {
    setIsSending(true);
    setError(null);
    setSent(false);

    try {
      await emailVerificationService.sendVerificationLink();
      setSent(true);
    } catch {
      setError("We couldn't send the verification email. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-email-title"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Mail size={25} aria-hidden="true" />
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Remind me later"
            className="rounded-lg p-2 text-text-muted hover:bg-background"
          >
            <X size={20} />
          </button>
        </div>

        <h2
          id="verify-email-title"
          className="mt-4 text-xl font-bold text-text"
        >
          Verify your email address
        </h2>

        <p className="mt-2 text-sm leading-6 text-text-muted">
          Verify your email to help keep your TallyHouse account secure. We'll
          send a verification link to:
        </p>

        <p className="mt-2 break-all font-semibold text-text">{email}</p>

        {sent && (
          <div
            role="status"
            className="mt-4 flex gap-2 rounded-lg border border-primary/20 bg-primary-light p-3 text-sm text-text"
          >
            <CheckCircle2 size={19} className="shrink-0 text-primary" />
            <span>
              Verification email sent. Check your inbox and spam folder.
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex gap-2 rounded-lg border border-danger/20 p-3 text-sm text-danger"
          >
            <AlertCircle size={19} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-input border border-border px-4 py-3 text-sm font-medium text-text hover:bg-background"
          >
            Remind me later
          </button>

          <button
            type="button"
            onClick={() => void sendVerificationLink()}
            disabled={isSending}
            className="flex flex-1 items-center justify-center gap-2 rounded-input bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Sending…
              </>
            ) : sent ? (
              "Resend verification link"
            ) : (
              "Verify email"
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
