import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useReviewSalesReturn, useSalesReturn } from "../hooks/useSalesReturns";
import { getSalesReturnErrorMessage } from "../services/sales-return.service";
import type { SalesReturnStatus } from "../types/sales-return.types";
import { formatDate, formatAmount, userLabel } from "../utils/format";
import ReturnStatusBadge from "../components/ReturnStatusBadge";
import { ErrorPanel, LoadingRows } from "../components/Feedback";

export default function SalesReturnDetailsPage() {
  const { returnId } = useParams<{ returnId: string }>();
  // const navigate = useNavigate();
  const location = useLocation();
  const query = useSalesReturn(returnId);
  const review = useReviewSalesReturn(returnId ?? "");
  const [note, setNote] = useState("");
  const item = query.data;
  const notice = (location.state as { notice?: string } | null)?.notice;

  async function setStatus(
    status: Extract<SalesReturnStatus, "approved" | "rejected">,
  ) {
    if (!returnId || !item) return;
    const prompt =
      status === "approved"
        ? "Approve this return? Stock and financial adjustments will be applied."
        : "Reject this return request?";
    if (!window.confirm(prompt)) return;

    try {
      await review.mutateAsync({
        action: status,
        note: note.trim() || undefined,
      });
      setNote("");
    } catch {
      // The API error is displayed below.
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 pb-8">
      <header>
        <Link
          to="/sales/returns"
          className="mb-3 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft size={16} /> Sales returns
        </Link>
        {item && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-text">
                  {item.reference}
                </h1>
                <ReturnStatusBadge status={item.status} />
              </div>
              <p className="mt-1 text-sm text-text-muted">
                Return request · Created {formatDate(item.created_at)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-input border border-border bg-surface px-3 py-2 text-sm font-semibold text-text hover:bg-background disabled:opacity-60"
            >
              <RotateCcw
                size={16}
                className={query.isFetching ? "animate-spin" : ""}
              />{" "}
              Refresh
            </button>
          </div>
        )}
      </header>

      {notice && (
        <div className="rounded-card border border-success/30 bg-success/10 p-3 text-sm text-success">
          {notice}
        </div>
      )}
      {query.isLoading && <LoadingRows rows={4} />}
      {query.isError && (
        <ErrorPanel
          message={getSalesReturnErrorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
      )}

      {item && (
        <>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <article className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm text-text-muted">Original sale</p>
              <Link
                to={`/sales/${item.invoice_id}`}
                className="mt-1 inline-block font-semibold text-primary hover:underline"
              >
                {item.invoice?.reference ?? item.invoice_id}
              </Link>
              <p className="mt-1 text-xs text-text-muted">
                {formatDate(item.invoice?.generated_at)}
              </p>
            </article>
            <article className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm text-text-muted">Customer</p>
              <p className="mt-1 font-semibold text-text">
                {item.invoice?.customer.name || "Walk-in customer"}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {item.invoice?.customer.phone ||
                  item.invoice?.customer.email ||
                  "No contact details"}
              </p>
            </article>
            <article className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm text-text-muted">Return value</p>
              <p className="mt-1 text-2xl font-bold text-text">
                {formatAmount(item.total_amount)}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {item.items?.length ?? 0} line(s)
              </p>
            </article>
          </section>

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
            <section className="space-y-4 rounded-card border border-border bg-surface p-4 sm:p-5">
              <div>
                <h2 className="font-semibold text-text">Returned items</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Condition determines whether quantities are returned to
                  available stock.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-150 text-left">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                      <th className="py-3 pr-3 font-semibold">Product</th>
                      <th className="px-3 py-3 font-semibold">Qty</th>
                      <th className="px-3 py-3 font-semibold">Condition</th>
                      <th className="px-3 py-3 font-semibold">Restock</th>
                      <th className="py-3 pl-3 text-right font-semibold">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(item.items ?? []).map((line) => (
                      <tr key={line.id}>
                        <td className="py-4 pr-3">
                          <p className="font-medium text-text">
                            {line.product?.name ??
                              line.invoice_item?.product?.name ??
                              "Product"}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {line.product?.sku ??
                              line.invoice_item?.product?.sku ??
                              "—"}
                          </p>
                          {line.reason && (
                            <p className="mt-1 text-xs text-text-muted">
                              {line.reason}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm text-text">
                          {line.quantity}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`text-sm font-medium ${line.condition === "saleable" ? "text-success" : "text-danger"}`}
                          >
                            {line.condition === "saleable"
                              ? "Saleable"
                              : "Damaged"}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-text">
                          {line.restock_quantity}
                        </td>
                        <td className="py-4 pl-3 text-right text-sm font-semibold text-text">
                          {formatAmount(line.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-card bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Reason for return
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-text">
                  {item.reason}
                </p>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="space-y-4 rounded-card border border-border bg-surface p-4 sm:p-5">
                <h2 className="font-semibold text-text">Financial impact</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-text-muted">
                      Return value
                    </span>
                    <span className="font-semibold text-text">
                      {formatAmount(item.total_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-text-muted">
                      Debt reduction
                    </span>
                    <span className="font-semibold text-text">
                      {formatAmount(item.debt_reduction_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-text-muted">
                      Customer credit recorded
                    </span>
                    <span className="font-semibold text-text">
                      {formatAmount(item.customer_credit_amount)}
                    </span>
                  </div>
                </div>
                <p className="border-t border-border pt-3 text-xs text-text-muted">
                  Customer credit is the amount recorded by this return. It is
                  not a spendable balance or proof of a refund unless a separate
                  credit/refund ledger is implemented.
                </p>
              </section>

              <section className="space-y-3 rounded-card border border-border bg-surface p-4 sm:p-5">
                <h2 className="font-semibold text-text">Request history</h2>
                <div className="flex items-start gap-3">
                  <Clock3 size={18} className="mt-0.5 text-text-muted" />
                  <div>
                    <p className="text-sm font-medium text-text">
                      Requested by
                    </p>
                    <p className="text-sm text-text-muted">
                      {userLabel(item.requester)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
                {item.approved_at && (
                  <div className="flex items-start gap-3">
                    {item.status === "approved" ? (
                      <CheckCircle2 size={18} className="mt-0.5 text-success" />
                    ) : (
                      <XCircle size={18} className="mt-0.5 text-danger" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-text">
                        {item.status === "approved"
                          ? "Approved by"
                          : "Reviewed by"}
                      </p>
                      <p className="text-sm text-text-muted">
                        {userLabel(item.approver)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatDate(item.approved_at)}
                      </p>
                    </div>
                  </div>
                )}
                {item.approval_note && (
                  <div className="rounded-input bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Review note
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-text">
                      {item.approval_note}
                    </p>
                  </div>
                )}
              </section>

              {item.status === "pending" && (
                <section className="space-y-3 rounded-card border border-border bg-surface p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <PackageCheck size={19} className="text-primary" />
                    <h2 className="font-semibold text-text">Review request</h2>
                  </div>
                  <p className="text-sm text-text-muted">
                    Approval applies saleable stock movements and calculates
                    debt reduction before any excess customer credit. Only the
                    owner or authorized staff can complete the review.
                  </p>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-text">
                      Review note (optional)
                    </span>
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder="Add an approval or rejection note"
                      className="w-full rounded-input border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                    />
                  </label>
                  {review.isError && (
                    <ErrorPanel
                      message={getSalesReturnErrorMessage(review.error)}
                    />
                  )}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={review.isPending}
                      onClick={() => void setStatus("rejected")}
                      className="inline-flex items-center justify-center gap-2 rounded-input border border-danger/40 px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5 disabled:opacity-60"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      type="button"
                      disabled={review.isPending}
                      onClick={() => void setStatus("approved")}
                      className="inline-flex items-center justify-center gap-2 rounded-input bg-primary px-3 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} />
                      {review.isPending ? "Saving…" : "Approve return"}
                    </button>
                  </div>
                </section>
              )}
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
