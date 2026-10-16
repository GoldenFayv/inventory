import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../app/AuthProvider";
import type { RegisterCredentials } from "../../types/auth.types";

type RegistrationField =
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
  | "password"
  | "password_confirmation";

type FieldErrors = Partial<Record<RegistrationField, string>>;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterCredentials>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: RegistrationField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setGeneralError("");
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setGeneralError("");

    if (form.password !== form.password_confirmation) {
      setErrors({
        password_confirmation: "Passwords do not match.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/create-store", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data;
        const backendErrors = response?.errors;

        if (backendErrors && typeof backendErrors === "object") {
          const mappedErrors: FieldErrors = {};

          for (const field of [
            "first_name",
            "last_name",
            "email",
            "phone",
            "password",
          ] as const) {
            const messages = backendErrors[field];

            if (Array.isArray(messages) && typeof messages[0] === "string") {
              mappedErrors[field] = messages[0];
            }
          }

          setErrors(mappedErrors);
          setGeneralError(
            Object.keys(mappedErrors).length
              ? ""
              : "Please check your details and try again.",
          );
        } else {
          setGeneralError(
            typeof response?.message === "string"
              ? response.message
              : "We could not create your account. Please try again.",
          );
        }
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = "w-full rounded-input border border-border bg-surface px-3 py-3 text-base text-text outline-none focus-visible:ring-2 focus-visible:ring-primary";

  function fieldError(field: RegistrationField) {
    return errors[field] ? (
      <p className="mt-1 text-sm text-danger" role="alert">
        {errors[field]}
      </p>
    ) : null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-7">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white">
            I
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-text-muted">
            Get started managing your shop, stock, sales and credit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium text-text"
              >
                First name
              </label>
              <input
                id="first_name"
                autoComplete="given-name"
                required
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                className={inputClass}
              />
              {fieldError("first_name")}
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="mb-2 block text-sm font-medium text-text"
              >
                Last name
              </label>
              <input
                id="last_name"
                autoComplete="family-name"
                required
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                className={inputClass}
              />
              {fieldError("last_name")}
            </div>
          </div>

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
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
            {fieldError("email")}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-text"
            >
              Phone number{" "}
              <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone ?? ""}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass}
              placeholder="Your phone number"
            />
            {fieldError("phone")}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-text"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={inputClass}
              placeholder="Create a strong password"
            />
            <p className="mt-1 text-xs text-text-muted">
              Use at least 8 characters with uppercase and lowercase letters, a
              number, and a symbol.
            </p>
            {fieldError("password")}
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-2 block text-sm font-medium text-text"
            >
              Confirm password
            </label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={form.password_confirmation}
              onChange={(e) =>
                updateField("password_confirmation", e.target.value)
              }
              className={inputClass}
              placeholder="Enter your password again"
            />
            {fieldError("password_confirmation")}
          </div>

          {generalError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-danger"
            >
              {generalError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-input bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
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
