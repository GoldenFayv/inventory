import { useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../app/AuthProvider";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const resetSuccessful =
    (location.state as { passwordReset?: boolean } | null)?.passwordReset ??
    false;

  const state = location.state as LocationState | null;
  const destination = state?.from?.pathname ?? "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      navigate(destination, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;

        setError(
          typeof message === "string"
            ? message
            : "Unable to sign in. Check your details and try again.",
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
        <div className="mb-8">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white">
            I
          </div>
          {resetSuccessful && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-primary-light p-3 text-sm text-text"
            >
              Password reset successfully. You can now sign in with your new
              password.
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-text-muted">
            Sign in to manage your shop, stock, sales and credit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="identifier"
              className="mb-2 block text-sm font-medium text-text"
            >
              Email or Phone Number
            </label>

            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              className="w-full rounded-input border border-border bg-surface px-3 py-3 text-base text-text outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Enter your email or phone number"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-input border border-border bg-surface px-3 py-3 text-base text-text outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Enter your password"
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
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          New User?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create your account now
          </Link>
        </p>
      </section>
    </main>
  );
}
