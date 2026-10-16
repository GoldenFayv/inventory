import { Link } from "react-router-dom";
import { ArrowRight, ReceiptText, RefreshCw } from "lucide-react";
import type { IInvoice } from "../../sales/types/sale.types";

type RecentSalesProps = {
  sales: IInvoice[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export default function RecentSales({
  sales,
  isLoading = false,
  isError = false,
  onRetry,
}: RecentSalesProps) {
  return (
    <section className="space-y-3" aria-labelledby="recent-sales-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="recent-sales-heading" className="text-lg font-bold text-text">
            Recent sales
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Your latest invoices and payment status.
          </p>
        </div>

        <Link
          to="/sales"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {isLoading ? (
          <div
            className="divide-y divide-border"
            aria-busy="true"
            aria-label="Loading recent sales"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-border" />
                  <div className="h-3 w-36 max-w-full animate-pulse rounded bg-border" />
                  <div className="h-3 w-24 animate-pulse rounded bg-border" />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-border" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-border" />
                </div>
              </div>
            ))}
            <p className="px-4 py-3 text-sm text-text-muted">
              Loading recent sales...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <ReceiptText
              size={28}
              className="text-text-muted"
              aria-hidden="true"
            />
            <p className="mt-3 font-medium text-text">
              Couldn't load recent sales
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Check your connection and try again.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-input border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light"
              >
                <RefreshCw size={16} aria-hidden="true" />
                Try again
              </button>
            )}
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <ReceiptText
              size={28}
              className="text-text-muted"
              aria-hidden="true"
            />
            <p className="mt-3 font-medium text-text">No sales yet</p>
            <p className="mt-1 text-sm text-text-muted">
              Your recent invoices will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sales.map((sale) => {
              const balance = Math.max(
                0,
                sale.total_amount - sale.total_amount_paid,
              );

              const status =
                balance === 0
                  ? "Paid"
                  : sale.total_amount_paid > 0
                    ? "Partial"
                    : "Unpaid";

              const statusStyles =
                status === "Paid"
                  ? "bg-primary-light text-success"
                  : status === "Partial"
                    ? "bg-amber-50 text-warning"
                    : "bg-red-50 text-danger";

              return (
                <Link
                  key={sale.id}
                  to={`/sales/${sale.id}`}
                  className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-background"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-text">
                      {sale.reference}
                    </p>
                    <p className="mt-1 truncate text-sm text-text-muted">
                      {sale.customer?.name || "Walk-in customer"}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {dateFormatter.format(new Date(sale.generated_at))}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-text">
                      {currencyFormatter.format(sale.total_amount)}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyles}`}
                    >
                      {status}
                    </span>
                    {balance > 0 && (
                      <p className="mt-1 text-xs text-text-muted">
                        Owes {currencyFormatter.format(balance)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
