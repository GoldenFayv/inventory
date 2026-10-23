import { RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

export default function RequestReturnLink({
  invoiceId,
  className = "",
}: {
  invoiceId: string;
  className?: string;
}) {
  return (
    <Link
      to={`/sales/${invoiceId}/returns/new`}
      className={`inline-flex items-center justify-center gap-2 rounded-input border border-border bg-surface px-3 py-2 text-sm font-semibold text-text transition hover:bg-background ${className}`}
    >
      <RotateCcw size={16} aria-hidden="true" />
      Request return
    </Link>
  );
}
