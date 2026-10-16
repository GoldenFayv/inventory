import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Package,
  RefreshCw,
} from "lucide-react";
import type IProduct from "../../products/types/product.types";

type LowStockListProps = {
  products: IProduct[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export default function LowStockList({
  products,
  isLoading = false,
  isError = false,
  onRetry,
}: LowStockListProps) {
  const outOfStock = products.filter((product) => product.quantity <= 0);
  const lowStock = products.filter((product) => product.quantity > 0);

  return (
    <section
      aria-labelledby="low-stock-heading"
      className="rounded-card border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="low-stock-heading" className="text-lg font-bold text-text">
            Stock alerts
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Products that may need restocking
          </p>
        </div>

        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-warning">
          <AlertTriangle size={20} aria-hidden="true" />
        </span>
      </div>
      {isLoading ? (
        <div className="space-y-3 py-6" aria-busy="true">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="size-10 animate-pulse rounded-lg bg-border" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-border" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-border" />
              </div>
            </div>
          ))}
          <p className="text-sm text-text-muted">Checking stock levels...</p>
        </div>
      ) : isError ? (
        <div className="py-6 text-center">
          <p className="font-medium text-text">Couldn't load stock alerts</p>
          <p className="mt-1 text-sm text-text-muted">
            Please check your connection and try again.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-input border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          )}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 size={30} className="text-success" aria-hidden="true" />
          <p className="mt-3 font-semibold text-text">All stocked up!</p>
          <p className="mt-1 max-w-xs text-sm text-text-muted">
            No products currently need restocking.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {outOfStock.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-3 py-4 first:pt-0"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-danger">
                <Package size={19} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text">{product.name}</p>
                {product.sku && (
                  <p className="mt-1 truncate text-xs text-text-muted">
                    SKU: {product.sku}
                  </p>
                )}
              </div>

              <span className="shrink-0 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-danger">
                Out of stock
              </span>
            </li>
          ))}

          {lowStock.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-3 py-4 last:pb-0"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-warning">
                <Package size={19} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text">{product.name}</p>
                {product.sku && (
                  <p className="mt-1 truncate text-xs text-text-muted">
                    SKU: {product.sku}
                  </p>
                )}
              </div>

              <span className="shrink-0 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-warning">
                {product.quantity} left
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/products"
        className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-input border border-border px-4 py-3 font-medium text-primary hover:bg-primary-light"
      >
        View all products
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}
