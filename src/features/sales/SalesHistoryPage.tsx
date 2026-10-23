import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { useSales } from "./useSales";
import { Link, useSearchParams } from "react-router-dom";

const currency = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

function getPaymentStatus(total: number, paid: number) {
  if (paid >= total) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

const statusStyles = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-amber-100 text-amber-700",
  unpaid: "bg-red-100 text-red-700",
};

export default function SalesHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // const [paymentStatus, setPaymentStatus] = useState<
  //   "all" | "paid" | "partial" | "unpaid"
  // >("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = search.trim();

      setDebouncedSearch(value);

      const next = new URLSearchParams(searchParams);

      if (value) {
        next.set("search", value);
      } else {
        next.delete("search");
      }

      next.delete("page");
      setSearchParams(next, { replace: true });
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, searchParams, setSearchParams]);

  const paymentStatus = (searchParams.get("status") ?? "all") as
    | "all"
    | "paid"
    | "partial"
    | "unpaid";

  const creditOnly = searchParams.get("credit") === "true";
  const date = searchParams.get("date") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const { data, isPending, isError, isFetching, refetch } = useSales(page, {
    search: debouncedSearch,
    paymentStatus,
    credit: creditOnly,
    date,
    from,
    to,
  });

  const sales = data?.data ?? [];
  const meta = data?.meta;

  function updateFilters(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    next.delete("page");
    setSearchParams(next);
    setPage(1);
  }

  return (
    <main className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Sales history</h1>
          <p className="mt-1 text-sm text-text-muted">
            View sales, payments, and outstanding balances.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/sales/new"
            className="inline-flex items-center gap-2 rounded-input bg-primary px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus size={18} aria-hidden="true" />
            Create Sale
          </Link>

          {sales.length > 0 && (
            <Link
              to="/sales/returns"
              className="inline-flex items-center gap-2 rounded-input border border-border bg-surface px-4 py-3 text-sm font-medium text-text transition hover:bg-background"
            >
              <Settings size={18} aria-hidden="true" />
              Manage Returns
            </Link>
          )}
        </div>
      </header>

      <section className="space-y-4 rounded-card border border-border bg-surface p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer, phone, or reference..."
            aria-label="Search sales"
            className="w-full rounded-input border border-border bg-background py-3 pl-10 pr-3 text-sm text-text outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label
            htmlFor="payment-status"
            className="text-sm font-medium text-text"
          >
            Payment status
          </label>

          <select
            id="payment-status"
            value={paymentStatus}
            onChange={(event) =>
              updateFilters({
                status: event.target.value === "all" ? "" : event.target.value,
              })
            }
            className="w-full rounded-input border border-border bg-background px-3 py-2.5 text-sm text-text sm:w-auto"
            disabled
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partially paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <span className="text-xs text-text-muted">
            Status filtering will be enabled when the API supports it.
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={creditOnly}
            onChange={(event) =>
              updateFilters({
                credit: event.target.checked ? "true" : "",
              })
            }
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Outstanding credit only
        </label>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label
              htmlFor="sale-from"
              className="text-sm font-medium text-text"
            >
              From
            </label>
            <input
              id="sale-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) =>
                updateFilters({
                  from: event.target.value,
                  to:
                    event.target.value && to && event.target.value > to
                      ? ""
                      : to,
                  date: "",
                })
              }
              className="rounded-input border border-border bg-background px-3 py-2 text-sm text-text"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="sale-to" className="text-sm font-medium text-text">
              To
            </label>
            <input
              id="sale-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) =>
                updateFilters({
                  to: event.target.value,
                  date: "",
                })
              }
              className="rounded-input border border-border bg-background px-3 py-2 text-sm text-text"
            />
          </div>

          <button
            type="button"
            onClick={() => updateFilters({ date: "", from: "", to: "" })}
            className="rounded-input border border-border px-3 py-2 text-sm text-text-muted hover:bg-background"
          >
            Clear dates
          </button>
        </div>
      </section>

      {isPending ? (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-sm text-text-muted">
          Loading sales...
        </div>
      ) : isError ? (
        <div className="rounded-card border border-border bg-surface p-6 text-center">
          <AlertCircle className="mx-auto text-red-500" size={28} />
          <p className="mt-3 font-medium text-text">Could not load sales</p>
          <p className="mt-1 text-sm text-text-muted">
            Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-input bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      ) : sales.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center">
          <ShoppingBag size={32} className="mx-auto text-text-muted" />
          <h2 className="mt-3 font-semibold text-text">No sales found</h2>
          <p className="mt-1 text-sm text-text-muted">
            Try a different search or record your first sale.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              {meta?.total ?? sales.length} sales
            </p>
            {isFetching && (
              <span className="text-xs text-text-muted">Updating...</span>
            )}
          </div>

          <section className="space-y-3">
            {sales.map((sale) => {
              const balance = Math.max(
                0,
                sale.total_amount - sale.total_amount_paid,
              );
              const status = getPaymentStatus(
                sale.total_amount,
                sale.total_amount_paid,
              );

              return (
                <article
                  key={sale.id}
                  className="rounded-card border border-border bg-surface p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-all text-sm font-semibold text-text">
                        {sale.reference}
                      </p>
                      <h2 className="mt-1 font-medium text-text">
                        {sale.customer.name}
                      </h2>
                      <p className="text-sm text-text-muted">
                        {sale.customer.phone}
                      </p>
                      <p className="mt-2 text-xs text-text-muted">
                        {new Date(sale.generated_at).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
                    >
                      {status === "partial" ? "Partially paid" : status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-text-muted">Total</p>
                      <p className="mt-1 font-semibold text-text">
                        {currency(sale.total_amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-text-muted">Paid</p>
                      <p className="mt-1 font-semibold text-text">
                        {currency(sale.total_amount_paid)}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs text-text-muted">
                        Outstanding balance
                      </p>
                      <p className="mt-1 font-semibold text-text">
                        {currency(balance)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Link
                      to={`/sales/${sale.id}`}
                      className="inline-flex text-sm font-semibold text-primary hover:underline"
                    >
                      View details and receipt
                    </Link>

                    <Link
                      to={`/sales/${sale.id}/returns/new`}
                      className="inline-flex items-center gap-2 rounded-input border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition hover:bg-background"
                    >
                      <RotateCcw size={16} aria-hidden="true" />
                      Return Items
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>

          <nav
            aria-label="Sales pagination"
            className="flex items-center justify-between gap-3"
          >
            <button
              type="button"
              onClick={() => setPage((current) => current - 1)}
              disabled={!meta || meta.current_page <= 1 || isFetching}
              className="inline-flex items-center gap-1 rounded-input border border-border px-3 py-2 text-sm text-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="text-sm text-text-muted">
              Page {meta?.current_page ?? page} of {meta?.last_page ?? 1}
            </span>

            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={
                !meta || meta.current_page >= meta.last_page || isFetching
              }
              className="inline-flex items-center gap-1 rounded-input border border-border px-3 py-2 text-sm text-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </nav>
        </>
      )}
    </main>
  );
}
