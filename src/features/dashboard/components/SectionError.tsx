import axios from "axios";
import { AlertCircle, RefreshCw } from "lucide-react";

type SectionErrorProps = {
  title: string;
  /** Pass the query's `error` so a 403 gets a permission message */
  error?: unknown;
  onRetry?: () => void;
};

export default function SectionError({
  title,
  error,
  onRetry,
}: SectionErrorProps) {
  const forbidden = axios.isAxiosError(error) && error.response?.status === 403;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-4 text-sm"
    >
      <AlertCircle size={20} className="shrink-0 text-text-muted" />

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-text">{title}</p>
        <p className="mt-0.5 text-text-muted">
          {forbidden
            ? "You don't have permission to view this section."
            : "We couldn't load this section. Check your connection and try again."}
        </p>
      </div>

      {onRetry && !forbidden && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-input border border-border bg-background px-3 py-2 font-semibold text-text hover:bg-surface"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      )}
    </div>
  );
}
