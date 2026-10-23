import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RotateCcw,
  Search,
} from "lucide-react";
import { useSalesReturns } from "../hooks/useSalesReturns";
import { getSalesReturnErrorMessage } from "../services/sales-return.service";
import type { SalesReturnStatus } from "../types/sales-return.types";
import { formatDate, formatAmount } from "../utils/format";
import ReturnStatusBadge from "../components/ReturnStatusBadge";
import { EmptyPanel, ErrorPanel, LoadingRows } from "../components/Feedback";
import RefreshButton from "../../../components/ui/RefreshButton";

const statuses: { value: SalesReturnStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function SalesReturnsPage() {
  const [status, setStatus] = useState<SalesReturnStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const query = useSalesReturns({ page, per_page: perPage, status });
  const allRows = useMemo(() => query.data?.data ?? [], [query]);
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return allRows;
    return allRows.filter((item) =>
      [
        item.reference,
        item.invoice?.reference,
        item.invoice?.customer.name,
        item.invoice?.customer.phone,
        item.reason,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [allRows, search]);

  const counts = {
    pending: allRows.filter((item) => item.status === "pending").length,
    approved: allRows.filter((item) => item.status === "approved").length,
    rejected: allRows.filter((item) => item.status === "rejected").length,
  };

  return (
    <main className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-text-muted">
            <RotateCcw size={16} aria-hidden="true" />
            Sales management
          </div>
          <h1 className="text-2xl font-bold text-text">Sales returns</h1>
          <p className="mt-1 text-sm text-text-muted">
            Track customer return requests, review item condition, and manage
            approvals.
          </p>
        </div>
        <RefreshButton
          onRefresh={query.refetch}
          isRefreshing={query.isFetching}
          loadingLabel="Refreshing..."
        />
      </header>

      <section
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        aria-label="Return status counts on this page"
      >
        {(
          [
            ["Pending", counts.pending, "text-warning"],
            ["Approved", counts.approved, "text-success"],
            ["Rejected", counts.rejected, "text-danger"],
          ] as const
        ).map(([label, count, color]) => (
          <article
            key={label}
            className="rounded-card border border-border bg-surface p-4"
          >
            <p className="text-sm text-text-muted">{label} on this page</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>
              {query.isLoading ? "—" : count}
            </p>
          </article>
        ))}
      </section>

      <section className="space-y-4 rounded-card border border-border bg-surface p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <span className="sr-only">Search returns on this page</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reference, customer, or reason"
              className="w-full rounded-input border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-text outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as SalesReturnStatus | "all");
                setPage(1);
              }}
              className="w-full rounded-input border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
            >
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {query.isLoading && <LoadingRows />}
        {query.isError && (
          <ErrorPanel
            message={getSalesReturnErrorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        )}

        {!query.isLoading && !query.isError && rows.length === 0 && (
          <EmptyPanel
            title={search ? "No matching returns" : "No sales returns yet"}
            description={
              search
                ? "Try another search term or clear your search."
                : "When a customer return is requested from a sale, it will appear here."
            }
          />
        )}

        {!query.isLoading && !query.isError && rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-3 py-3 font-semibold">Return</th>
                    <th className="px-3 py-3 font-semibold">Sale / customer</th>
                    <th className="px-3 py-3 font-semibold">Items</th>
                    <th className="px-3 py-3 font-semibold">Value</th>
                    <th className="px-3 py-3 font-semibold">Requested</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 text-right font-semibold"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-background/60"
                    >
                      <td className="px-3 py-4">
                        <Link
                          to={`/sales/returns/${item.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {item.reference}
                        </Link>
                        <p className="mt-1 max-w-44 truncate text-xs text-text-muted">
                          {item.reason}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-medium text-text">
                          {item.invoice?.reference ?? "Sale unavailable"}
                        </p>
                        <p className="mt-1 text-sm text-text-muted">
                          {item.invoice?.customer.name ||
                            item.invoice?.customer.phone ||
                            "Walk-in customer"}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-sm text-text">
                        {item.items?.length ?? 0}
                        {/* line
                        {item.items?.length === 1 ? "" : "s"} */}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap font-semibold text-text">
                        {formatAmount(item.total_amount)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-text-muted">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-3 py-4">
                        <ReturnStatusBadge status={item.status} />
                      </td>
                      <td className="px-3 py-4 text-right">
                        <Link
                          to={`/sales/returns/${item.id}`}
                          aria-label={`View return ${item.reference}`}
                          className="inline-flex items-center gap-1 rounded-input px-2 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
                        >
                          View <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-muted">
                Showing {rows.length} filtered record
                {rows.length === 1 ? "" : "s"} on this page ·{" "}
                {query.data?.total ?? rows.length} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || query.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="inline-flex items-center gap-1 rounded-input border border-border px-3 py-2 text-sm text-text disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="px-2 text-sm text-text-muted">
                  Page {query.data?.current_page ?? page} of{" "}
                  {query.data?.last_page ?? 1}
                </span>
                <button
                  type="button"
                  disabled={
                    page >= (query.data?.last_page ?? 1) || query.isFetching
                  }
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1 rounded-input border border-border px-3 py-2 text-sm text-text disabled:opacity-40"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-card border border-border bg-background p-4 text-sm text-text-muted">
        <ClipboardList size={18} className="mt-0.5 shrink-0" />
        <p>
          Pending requests do not change stock or invoice balances. Stock and
          financial adjustments are made only after an authorized approval
          succeeds.
        </p>
      </div>
    </main>
  );
}
