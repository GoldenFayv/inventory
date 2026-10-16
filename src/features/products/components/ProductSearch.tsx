import { Search, X } from "lucide-react";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <div className="relative">
      <Search
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />

      <input
        type="search"
        id="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search products by name or SKU..."
        aria-label="Search products by name or SKU"
        className="w-full rounded-input border border-border bg-surface py-3 pl-10 pr-10 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
