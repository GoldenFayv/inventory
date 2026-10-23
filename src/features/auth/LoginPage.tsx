import { useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../app/AuthProvider";
import {
  normalizeIdentifier,
  validateIdentifier,
  validatePassword,
} from "../../utils/helper";
import Field from "../../components/ui/Field";
import Logo from "../../components/layout/LogoMark";
import { isReturningUser, markReturningUser } from "../../utils/returningUser";

interface LocationState {
  from?: {
    pathname?: string;
  };
  passwordReset?: boolean;
}

interface FieldErrors {
  identifier?: string;
  password?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const resetSuccessful = state?.passwordReset ?? false;
  const destination = state?.from?.pathname ?? "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const errors: FieldErrors = {
      identifier: validateIdentifier(identifier) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };
    setFieldErrors(errors);

    if (errors.identifier || errors.password) return;

    setIsSubmitting(true);

    try {
      await login({
        identifier: normalizeIdentifier(identifier),
        password,
      });
      markReturningUser();
      navigate(destination, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Laravel validation errors (422)
        const apiErrors = err.response?.data?.errors;
        if (err.response?.status === 422 && apiErrors) {
          setFieldErrors({
            identifier: apiErrors.identifier?.[0],
            password: apiErrors.password?.[0],
          });
          return;
        }

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

  const [returning] = useState(isReturningUser);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-8 justify-center">
          <Logo tagline="Retail Management Suite" className="mb-6" />

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
            {returning ? "Welcome back" : "Welcome to TallyHouse"}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {returning
              ? "Sign in to pick up where you left off."
              : "Sign in to manage your shop, stock, sales and credit."}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Field
            label="Email or Phone Number"
            type="text"
            value={identifier}
            onChange={(value) => {
              setIdentifier(value);
              if (fieldErrors.identifier) {
                setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
              }
            }}
            errors={
              fieldErrors.identifier ? [fieldErrors.identifier] : undefined
            }
            disabled={isSubmitting}
            placeholder="Email or phone number"
            autoComplete="identifier"
            id="identifier"
          />

          <div>
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              errors={fieldErrors.password ? [fieldErrors.password] : undefined}
              disabled={isSubmitting}
              placeholder="Enter your password"
              autoComplete="current-password"
              id="password"
            />
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
