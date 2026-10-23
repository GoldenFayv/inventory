import { useMemo, useState, type SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, RotateCcw } from "lucide-react";
import {
  useCreateSalesReturn,
  useInvoiceForReturn,
} from "../hooks/useSalesReturns";
import { getSalesReturnErrorMessage } from "../services/sales-return.service";
import type {
  CreateSalesReturnItemPayload,
  ReturnItemCondition,
} from "../types/sales-return.types";
import { formatDate, formatAmount } from "../utils/format";
import { ErrorPanel, LoadingRows } from "../components/Feedback";

export default function CreateSalesReturnPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const invoiceQuery = useInvoiceForReturn(invoiceId);
  const createReturn = useCreateSalesReturn(invoiceId ?? "");
  const [reason, setReason] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [conditions, setConditions] = useState<
    Record<string, ReturnItemCondition>
  >({});
  const [itemReasons, setItemReasons] = useState<Record<string, string>>({});
  const invoice = invoiceQuery.data;

  const selectedItems = useMemo(() => {
    if (!invoice) return [];
    return invoice.items
      .map((item) => ({
        item,
        quantity: Math.max(
          0,
          Math.min(Number(quantities[item.id] ?? 0), item.quantity),
        ),
      }))
      .filter(({ quantity }) => quantity > 0);
  }, [invoice, quantities]);

  const totalKobo = selectedItems.reduce(
    (sum, entry) => sum + entry.quantity * Number(entry.item.unit_price),
    0,
  );

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invoiceId || !reason.trim() || selectedItems.length === 0) return;

    const items: CreateSalesReturnItemPayload[] = selectedItems.map(
      ({ item, quantity }) => ({
        invoice_item_id: item.id,
        quantity,
        condition: conditions[item.id] ?? "saleable",
        ...(itemReasons[item.id]?.trim()
          ? { reason: itemReasons[item.id].trim() }
          : {}),
      }),
    );

    try {
      const created = await createReturn.mutateAsync({
        reason: reason.trim(),
        items,
      });
      navigate(`/sales/returns/${created.id}`, {
        replace: true,
        state: { notice: "Return request submitted successfully." },
      });
    } catch {
      // The API error is shown below.
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 pb-8">
      <header>
        <Link
          to="/sales"
          className="mb-3 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft size={16} /> Sales
        </Link>
        <h1 className="text-2xl font-bold text-text">Request a sales return</h1>
        <p className="mt-1 text-sm text-text-muted">
          Choose the original invoice lines, quantities, and item condition. The
          request will be reviewed before stock or balances change.
        </p>
      </header>

      {invoiceQuery.isLoading && <LoadingRows rows={3} />}
      {invoiceQuery.isError && (
        <ErrorPanel
          message={getSalesReturnErrorMessage(invoiceQuery.error)}
          onRetry={() => invoiceQuery.refetch()}
        />
      )}

      {invoice && (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm text-text-muted">Original sale</p>
              <p className="mt-1 font-semibold text-text">
                {invoice.reference ?? invoice.id}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {formatDate(invoice.generated_at)}
              </p>
            </article>
            <article className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm text-text-muted">Customer</p>
              <p className="mt-1 font-semibold text-text">
                {invoice.customer.name || "Walk-in customer"}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {invoice.customer.phone ||
                  invoice.customer.email ||
                  "No contact details"}
              </p>
            </article>
            <article className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm text-text-muted">Original invoice total</p>
              <p className="mt-1 text-xl font-bold text-text">
                {formatAmount(invoice.total_amount)}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Paid: {formatAmount(invoice.total_amount_paid)}
              </p>
            </article>
          </section>

          <form onSubmit={submit} className="space-y-5">
            <section className="space-y-4 rounded-card border border-border bg-surface p-4 sm:p-5">
              <div>
                <h2 className="font-semibold text-text">
                  Items being returned
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  Enter a quantity greater than zero for each item included in
                  this return.
                </p>
              </div>

              {invoice.items.length === 0 && (
                <p className="text-sm text-text-muted">
                  No invoice items were returned by the API for this sale.
                </p>
              )}

              {invoice.items.map((item) => {
                const quantity = Math.max(
                  0,
                  Math.min(Number(quantities[item.id] ?? 0), item.quantity),
                );
                const condition = conditions[item.id] ?? "saleable";
                const productName = item.product?.name ?? "Product";
                return (
                  <article
                    key={item.id}
                    className="space-y-4 rounded-card border border-border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Package size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-text">
                          {productName}
                        </h3>
                        <p className="mt-1 text-sm text-text-muted">
                          SKU: {item.product?.sku || "—"} · Sold {item.quantity}{" "}
                          · {formatAmount(item.unit_price)} each
                        </p>
                      </div>
                      <div className="w-24 shrink-0">
                        <label
                          htmlFor={`quantity-${item.id}`}
                          className="mb-1 block text-xs font-medium text-text-muted"
                        >
                          Return qty
                        </label>
                        <input
                          id={`quantity-${item.id}`}
                          type="number"
                          min={0}
                          max={item.quantity}
                          step={1}
                          value={quantities[item.id] ?? 0}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            setQuantities((current) => ({
                              ...current,
                              [item.id]: Number.isFinite(next)
                                ? Math.max(0, Math.min(next, item.quantity))
                                : 0,
                            }));
                          }}
                          className="w-full rounded-input border border-border bg-background px-3 py-2 text-text outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {quantity > 0 && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <fieldset className="space-y-2">
                          <legend className="mb-2 text-sm font-medium text-text">
                            Condition
                          </legend>
                          <label className="flex cursor-pointer items-start gap-2 rounded-input border border-border p-3">
                            <input
                              type="radio"
                              name={`condition-${item.id}`}
                              checked={condition === "saleable"}
                              onChange={() =>
                                setConditions((current) => ({
                                  ...current,
                                  [item.id]: "saleable",
                                }))
                              }
                              className="mt-1 accent-primary"
                            />
                            <span>
                              <span className="block text-sm font-medium text-text">
                                Saleable
                              </span>
                              <span className="block text-xs text-text-muted">
                                Returned to available stock after approval.
                              </span>
                            </span>
                          </label>
                          <label className="flex cursor-pointer items-start gap-2 rounded-input border border-border p-3">
                            <input
                              type="radio"
                              name={`condition-${item.id}`}
                              checked={condition === "damaged"}
                              onChange={() =>
                                setConditions((current) => ({
                                  ...current,
                                  [item.id]: "damaged",
                                }))
                              }
                              className="mt-1 accent-primary"
                            />
                            <span>
                              <span className="block text-sm font-medium text-text">
                                Damaged
                              </span>
                              <span className="block text-xs text-text-muted">
                                Recorded separately; not restocked.
                              </span>
                            </span>
                          </label>
                        </fieldset>
                        <label className="block space-y-1">
                          <span className="text-sm font-medium text-text">
                            Item-specific note (optional)
                          </span>
                          <textarea
                            value={itemReasons[item.id] ?? ""}
                            onChange={(event) =>
                              setItemReasons((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))
                            }
                            rows={4}
                            maxLength={1000}
                            placeholder="Describe the item's condition or issue"
                            className="w-full rounded-input border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                          />
                        </label>
                        <div className="md:col-span-2 flex items-center justify-between border-t border-border pt-3">
                          <span className="text-sm text-text-muted">
                            {condition === "saleable"
                              ? `${quantity} unit(s) to restock after approval`
                              : `${quantity} damaged unit(s), not restocked`}
                          </span>
                          <span className="font-semibold text-text">
                            {formatAmount(quantity * item.unit_price)}
                          </span>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>

            <section className="space-y-4 rounded-card border border-border bg-surface p-4 sm:p-5">
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-text">
                  Reason for return <span className="text-danger">*</span>
                </span>
                <textarea
                  required
                  minLength={1}
                  maxLength={1000}
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain why the customer is returning these products."
                  className="w-full rounded-input border border-border bg-background px-3 py-2 text-text outline-none focus:border-primary"
                />
              </label>

              <div className="rounded-card bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-text-muted">
                      Estimated return value
                    </p>
                    <p className="mt-1 text-2xl font-bold text-text">
                      {formatAmount(totalKobo)}
                    </p>
                  </div>
                  <span className="text-sm text-text-muted">
                    {selectedItems.length} selected line(s)
                  </span>
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  This request does not change stock or the invoice balance
                  until an authorized reviewer approves it. The server validates
                  the remaining returnable quantity.
                </p>
              </div>

              {createReturn.isError && (
                <ErrorPanel
                  message={getSalesReturnErrorMessage(createReturn.error)}
                />
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Link
                  to={`/sales/${invoice.id}`}
                  className="inline-flex items-center justify-center rounded-input border border-border px-4 py-2.5 text-sm font-semibold text-text hover:bg-background"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={
                    createReturn.isPending ||
                    !reason.trim() ||
                    selectedItems.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-input bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RotateCcw size={16} />
                  {createReturn.isPending
                    ? "Submitting…"
                    : "Submit return request"}
                </button>
              </div>
            </section>
          </form>
        </>
      )}
    </main>
  );
}
