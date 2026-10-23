import { AlertCircle, PackageSearch } from "lucide-react";

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-card border border-danger/30 bg-danger/5 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="mt-0.5 shrink-0 text-danger" />
        <div className="min-w-0">
          <p className="font-medium text-text">Something needs attention</p>
          <p className="mt-1 text-sm text-text-muted">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface px-5 py-12 text-center">
      <PackageSearch size={36} aria-hidden="true" className="mx-auto text-text-muted" />
      <h2 className="mt-3 font-semibold text-text">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">{description}</p>
    </div>
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-card border border-border bg-surface"
        />
      ))}
    </div>
  );
}
