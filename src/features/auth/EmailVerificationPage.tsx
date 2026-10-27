import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailCheck, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../../app/AuthProvider";
import LogoMark from "../../components/layout/LogoMark";

type VerificationStatus = "success" | "invalid" | "unknown";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  const requestedStatus = searchParams.get("status");

  const [status, setStatus] = useState<VerificationStatus>(() => {
    if (requestedStatus === "success") return "success";
    if (requestedStatus === "invalid") return "invalid";
    return "unknown";
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function confirmVerification() {
      if (requestedStatus === "success") {
        try {
          await refreshUser();

          if (!cancelled) {
            setStatus("success");
            setMessage(
              "Your email address has been verified successfully. You can continue using TallyHouse.",
            );
          }
        } catch {
          if (!cancelled) {
            // The backend has already verified the email.
            // A temporary profile refresh failure shouldn't undo that result.
            setStatus("success");
            setMessage(
              "Your email has been verified. Sign in again or refresh your session to update your account status.",
            );
          }
        }

        return;
      }

      if (requestedStatus === "invalid") {
        setStatus("invalid");
        setMessage(
          "This verification link is invalid or has expired. Request a new link and try again.",
        );
        return;
      }

      setStatus("unknown");
      setMessage(
        "Open the verification link sent to your email. If the link has expired, sign in and request a new one.",
      );
    }

    void confirmVerification();

    return () => {
      cancelled = true;
    };
  }, [requestedStatus, refreshUser]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10 text-text">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/" aria-label="TallyHouse home">
            <LogoMark />
          </Link>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm sm:p-8">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
              status === "success"
                ? "bg-primary-light text-primary"
                : "bg-background text-text-muted"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 size={32} />
            ) : status === "invalid" ? (
              <AlertCircle size={32} />
            ) : (
              <MailCheck size={32} />
            )}
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            {status === "success"
              ? "Email verified!"
              : status === "invalid"
                ? "Verification link unavailable"
                : "Verify your email"}
          </h1>

          <p
            className="mt-3 text-sm leading-6 text-text-muted"
            role={status === "invalid" ? "alert" : "status"}
          >
            {message}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {status === "success" ? (
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-input bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Continue to TallyHouse
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-input bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Sign in to continue
              </Link>
            )}

            {status !== "success" && (
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-input border border-border px-4 py-3 text-sm font-medium text-text hover:bg-background"
              >
                <ArrowLeft size={17} />
                Return home
              </Link>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-text-muted">
          Need help? Contact the TallyHouse support team.
        </p>
      </div>
    </main>
  );
}
