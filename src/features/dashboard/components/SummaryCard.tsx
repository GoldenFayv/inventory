import type { LucideIcon } from "lucide-react";

type SummaryCardProps = {
  label: string;
  amount: number;
  description: string;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "danger";
  isCurrency?: boolean;
};

const colorStyles = {
  primary: "bg-primary-light text-primary",
  success: "bg-primary-light text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function SummaryCard({
  label,
  amount,
  description,
  icon: Icon,
  color,
  isCurrency = true,
}: SummaryCardProps) {
  return (
        <article className="min-w-0 rounded-card border border-border bg-surface p-3 sm:p-5">
    {/* // <article className="min-w-0 rounded-card border border-border bg-surface sm:p-5 sm:m-6"> */}
      {/* <article className="min-w-0 rounded-card border border-border bg-surface p-6 sm:p-8">  */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-5 text-text-muted">{label}</p>

        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colorStyles[color]}`}
        >
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>

      <p className="mt-4 wrap-break-words text-2xl font-bold tracking-tight text-text sm:text-3xl">
        {isCurrency
          ? currencyFormatter.format(amount)
          : amount.toLocaleString("en-NG")}
      </p>

      <p className="mt-2 text-xs leading-5 text-text-muted sm:text-sm">
        {description}
      </p>
    </article>
  );
}
