type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  hint?: string;
  id?: string
};

export default function Field({
  label,
  value,
  onChange,
  errors,
  type = "text",
  placeholder,
  required,
  disabled,
  autoComplete,
  className = "",
  hint,
  readOnly,
  id
}: FieldProps) {
  return (
    <label className={`block space-y-1 ${className}`} htmlFor={id}>
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        required={required}
        id={id}
        readOnly={readOnly}
        type={type}
        value={value}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={!!errors?.length}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-input border bg-background px-3 py-2.5 text-text outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 ${
          errors?.length ? "border-danger" : "border-border"
        }`}
      />
      {hint && !errors?.length && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
      {errors?.map((message) => (
        <p key={message} className="text-sm text-danger">
          {message}
        </p>
      ))}
    </label>
  );
}
