import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { passwordResetService } from "./services/password.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await passwordResetService.requestReset({
        email: email.trim(),
      });

      setSuccess(
        response.message ??
          "If an account exists for that email, password reset instructions will be sent.",
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;

        setError(
          typeof message === "string"
            ? message
            : "Unable to request a password reset. Please try again.",
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
          Forgot your password?
        </h1>

        <p className="mt-2 text-sm text-text-muted">
          Enter the email address associated with your account and we'll send
          instructions to reset your password.
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
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-input border border-border bg-surface px-3 py-3 text-base text-text outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="you@example.com"
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

          {success && (
            <p
              role="status"
              className="rounded-lg bg-primary-light p-3 text-sm text-text"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-input bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending instructions..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
