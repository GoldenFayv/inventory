export const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** API monetary values are integer kobo, matching the Laravel database. */
export function formatAmount(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);
  return naira.format((Number.isFinite(amount) ? amount : 0));
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function userLabel(user?: {
  first_name?: string;
  last_name?: string;
  name?: string;
} | null): string {
  if (!user) return "—";
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fullName || user.name || "—";
}
