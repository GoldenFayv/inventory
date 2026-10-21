import { useState, type SubmitEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { passwordResetService } from "./services/password.service";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") ?? "";
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Your reset link is missing its token. Request a new one.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await passwordResetService.resetPassword({
        token,
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      navigate("/login", {
        replace: true,
        state: { passwordReset: true },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        const message = responseData?.message;
        const validationErrors = responseData?.errors;

        setError(
          typeof message === "string"
            ? message
            : typeof validationErrors === "object" && validationErrors
              ? Object.values(validationErrors).flat().join(" ")
              : "Unable to reset your password. The link may have expired.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Set a new password
        </h1>

        <p className="mt-2 text-sm text-text-muted">
          Choose a strong password for your TallyHouse account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-text"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-input border border-border bg-surface px-3 py-3 text-base text-text outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-text"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-input border border-border bg-surface px-3 py-3 text-base text-text outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Enter a new password"
            />
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-2 block text-sm font-medium text-text"
            >
              Confirm new password
            </label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-input border border-border bg-surface px-3 py-3 text-base text-text outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Confirm your new password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-input bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Resetting password..." : "Reset password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
