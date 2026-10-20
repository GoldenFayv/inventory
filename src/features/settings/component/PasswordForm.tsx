import { useState, type SubmitEvent } from "react";
import { useChangePassword } from "../hooks/useProfile";
import { getValidationErrors } from "../../../lib/error";
import { Lock } from "lucide-react";
import PasswordField from "../../../components/ui/PasswordField";

const emptyPasswords = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

export default function PasswordForm() {
  const changePassword = useChangePassword();
  const [values, setValues] = useState(emptyPasswords);

  const { message, fields } = getValidationErrors(
    changePassword.error,
    "Could not change your password. Please try again.",
  );
  const hasFieldErrors = Object.keys(fields).length > 0;

  const mismatch =
    values.password_confirmation.length > 0 &&
    values.password !== values.password_confirmation;

  function setField(key: keyof typeof emptyPasswords, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (changePassword.isError || changePassword.isSuccess) {
      changePassword.reset();
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mismatch) return;

    changePassword.mutate(values, {
      onSuccess: () => setValues(emptyPasswords),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-card border border-border bg-surface p-4 md:p-6"
    >
      <div className="flex items-center gap-2">
        <Lock size={20} className="text-primary" />
        <div>
          <h2 className="font-semibold text-text">Change password</h2>
          <p className="text-sm text-text-muted">
            Use a strong password you don't use anywhere else.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 sm:max-w-md">
          <PasswordField
            label="Current password"
            value={values.current_password}
            onChange={(v) => setField("current_password", v)}
            errors={fields.current_password}
            autoComplete="current-password"
          />
        </div>

        <PasswordField
          label="New password"
          value={values.password}
          onChange={(v) => setField("password", v)}
          errors={fields.password}
          autoComplete="new-password"
          hint="At least 8 characters."
        />

        <PasswordField
          label="Confirm new password"
          value={values.password_confirmation}
          onChange={(v) => setField("password_confirmation", v)}
          errors={
            mismatch
              ? ["Passwords do not match."]
              : fields.password_confirmation
          }
          autoComplete="new-password"
        />
      </div>

      {changePassword.isError && !hasFieldErrors && (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      )}

      {changePassword.isSuccess && (
        <p role="status" className="text-sm text-success">
          Password updated.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={
            changePassword.isPending ||
            mismatch ||
            !values.current_password ||
            !values.password ||
            !values.password_confirmation
          }
          className="rounded-input bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {changePassword.isPending ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}
