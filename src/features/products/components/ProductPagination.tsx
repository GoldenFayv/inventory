import { ChevronLeft, ChevronRight } from "lucide-react";
import type { IPaginationMeta } from "../../../types/pagination.types";

interface ProductPaginationProps {
  meta: IPaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function ProductPagination({
  meta,
  onPageChange,
  disabled = false,
}: ProductPaginationProps) {
  const { current_page, last_page, from, to, total } = meta;

  if (total === 0 || last_page <= 1) {
    return <p className="text-sm text-text-muted">Showing {total} products</p>;
  }

  return (
    <nav
      aria-label="Product pagination"
      className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-text-muted">
        Showing {from ?? 0}–{to ?? 0} of {total} products
      </p>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(current_page - 1)}
          disabled={disabled || current_page <= 1}
          className="inline-flex items-center gap-1 rounded-input border border-border bg-surface px-3 py-2 text-sm text-text transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Previous
        </button>

        <span className="text-sm text-text-muted">
          Page {current_page} of {last_page}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(current_page + 1)}
          disabled={disabled || current_page >= last_page}
          className="inline-flex items-center gap-1 rounded-input border border-border bg-surface px-3 py-2 text-sm text-text transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
