import { RotateCcw } from "lucide-react";

type RefreshButtonProps = {
  onRefresh: () => unknown;
  /** Pass your query's `isFetching` */
  isRefreshing?: boolean;
  label?: string;
  loadingLabel?: string;
  /** Show only the icon (good for tight headers on mobile) */
  iconOnly?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function RefreshButton({
  onRefresh,
  isRefreshing = false,
  label = "Refresh",
  loadingLabel,
  iconOnly = false,
  disabled = false,
  className = "",
}: RefreshButtonProps) {
  const text = isRefreshing && loadingLabel ? loadingLabel : label;

  return (
    <button
      type="button"
      onClick={() => void onRefresh()}
      disabled={disabled || isRefreshing}
      aria-busy={isRefreshing}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-input border border-border bg-surface text-sm font-semibold text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${
        iconOnly ? "size-9" : "px-3 py-2"
      } ${className}`}
    >
      <RotateCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
      {!iconOnly && text}
    </button>
  );
}
