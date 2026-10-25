export type DocumentType = "invoice" | "receipt";

const OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
];

type DocumentTypeSwitchProps = {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
  className?: string;
};

export default function DocumentTypeSwitch({
  value,
  onChange,
  className = "",
}: DocumentTypeSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Document format"
      className={`inline-flex rounded-input border border-border bg-background p-0.5 ${className}`}
    >
      {OPTIONS.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-[calc(var(--radius-input,0.5rem)-2px)] px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              active
                ? "bg-surface text-primary shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
