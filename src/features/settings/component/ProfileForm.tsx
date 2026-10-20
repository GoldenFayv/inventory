import { useState, type SubmitEvent } from "react";
import { useUpdateProfile } from "../hooks/useProfile";
import type IUser from "../../../types/user.types";
import { getValidationErrors } from "../../../lib/error";
import Field from "../../../components/ui/Field";
import { User } from "lucide-react";

type ProfileValues = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
};

function toProfileValues(user: IUser): ProfileValues {
  return {
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    phone: user.phone ?? "",
    email: user.email ?? "",
  };
}

export default function ProfileForm({ user }: { user: IUser }) {
  const updateProfile = useUpdateProfile();
  const [values, setValues] = useState<ProfileValues>(() =>
    toProfileValues(user),
  );

  const saved = toProfileValues(user);
  const isDirty = (Object.keys(values) as (keyof ProfileValues)[]).some(
    (key) => values[key] !== saved[key],
  );

  const { message, fields } = getValidationErrors(
    updateProfile.error,
    "Could not update your profile. Please try again.",
  );
  const hasFieldErrors = Object.keys(fields).length > 0;

  function setField(key: keyof ProfileValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (updateProfile.isError || updateProfile.isSuccess) {
      updateProfile.reset();
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isDirty) return;

    updateProfile.mutate({
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      phone: values.phone.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-card border border-border bg-surface p-4 md:p-6"
    >
      <div className="flex items-center gap-2">
        <User size={20} className="text-primary" />
        <div>
          <h2 className="font-semibold text-text">Personal details</h2>
          <p className="text-sm text-text-muted">
            Your name and contact information.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          required
          value={values.first_name}
          onChange={(v) => setField("first_name", v)}
          errors={fields.first_name}
          autoComplete="given-name"
        />
        <Field
          label="Last name"
          required
          value={values.last_name}
          onChange={(v) => setField("last_name", v)}
          errors={fields.last_name}
          autoComplete="family-name"
        />
        <Field
          label="Phone"
          type="tel"
          value={values.phone}
          onChange={(v) => setField("phone", v)}
          errors={fields.phone}
          autoComplete="tel"
        />
        <Field
          label="Email"
          onChange={(v) => setField("email", v)}
          type="email"
          readOnly
          value={user.email}
          hint={user.email_verified ? "Verified" : "Not verified"}
        />
      </div>

      {updateProfile.isError && !hasFieldErrors && (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      )}

      {updateProfile.isSuccess && (
        <p role="status" className="text-sm text-success">
          Profile updated.
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setValues(toProfileValues(user));
            updateProfile.reset();
          }}
          disabled={!isDirty || updateProfile.isPending}
          className="rounded-input border border-border px-4 py-2.5 text-sm font-medium text-text disabled:cursor-not-allowed disabled:opacity-60"
        >
          Discard changes
        </button>

        <button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className="rounded-input bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateProfile.isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
