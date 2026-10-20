export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  errors,
  disabled,
  className = "",
}: {
  label: string;
  value: Id;
  onChange: (value: string) => void;
  options: { id: Id; name: string }[];
  placeholder: string;
  errors?: string[];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-sm font-medium text-text">{label}</span>
      <select
        value={value}
        disabled={disabled}
        aria-invalid={!!errors?.length}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-input border bg-background px-3 py-2.5 text-text outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 ${
          errors?.length ? "border-danger" : "border-border"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {errors?.map((m) => (
        <p key={m} className="text-sm text-danger">
          {m}
        </p>
      ))}
    </label>
  );
}
