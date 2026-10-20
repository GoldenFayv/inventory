import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordField({
  label,
  value,
  onChange,
  errors,
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  autoComplete: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-text">{label}</span>
        <div className="relative">
          <input
            required
            type={visible ? "text" : "password"}
            value={value}
            autoComplete={autoComplete}
            aria-invalid={!!errors?.length}
            onChange={(event) => onChange(event.target.value)}
            className={`w-full rounded-input border bg-background py-2.5 pl-3 pr-11 text-text outline-none focus:border-primary ${
              errors?.length ? "border-danger" : "border-border"
            }`}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? `Hide ${label}` : `Show ${label}`}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text-muted hover:text-text"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      {hint && !errors?.length && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
      {errors?.map((message) => (
        <p key={message} className="text-sm text-danger">
          {message}
        </p>
      ))}
    </div>
  );
}
