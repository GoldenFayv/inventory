import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";
import { useSale, useUpdateSale } from "./useSales";
import AddItemsForm from "./components/AddItemsForm";
import PayInvoiceForm from "./components/PayInvoiceForm";
import { useProducts } from "../products/useProduct";

const money = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

const STATUS = {
  paid: { label: "Paid", className: "border-primary text-primary" },
  partial: { label: "Part paid", className: "border-amber-600 text-amber-600" },
  unpaid: { label: "Unpaid", className: "border-danger text-danger" },
} as const;

/** Torn paper edge. Hidden when printing. */
function Teeth({ id, flip = false }: { id: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="100%"
      height="8"
      className={`block print:hidden ${flip ? "rotate-180" : ""}`}
    >
      <defs>
        <pattern id={id} width="16" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0H16L8 8Z" className="fill-surface" />
        </pattern>
      </defs>
      <rect width="100%" height="8" fill={`url(#${id})`} />
    </svg>
  );
}

function Divider() {
  return <div className="my-5 border-t border-dashed border-border" />;
}

function Line({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${strong ? "text-base font-bold text-text" : ""}`}
    >
      <span className={strong ? "" : "text-text-muted"}>{label}</span>
      <span className="min-w-0 break-all text-right tabular-nums text-text">
        {value}
      </span>
    </div>
  );
}

export default function SaleDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const saleQuery = useSale(id);
  const sale = saleQuery.data;

  const updateSale = useUpdateSale(id);

  const [productSearch, setProductSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(productSearch.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [productSearch]);

  const products = useProducts(1, debouncedSearch);

  function handlePayment(amount: number, method: "cash" | "transfer") {
    updateSale.mutate({ amount: amount, payment_method: method });
  }

  function handleAddItems(items: { product_id: Id; quantity: number }[]) {
    updateSale.mutate({ items });
  }

  if (saleQuery.isPending) {
    return (
      <main className="p-6 text-sm text-text-muted">
        Loading sale details...
      </main>
    );
  }

  if (saleQuery.isError || !sale) {
    return (
      <main className="space-y-4 rounded-card border border-border bg-surface p-6">
        <AlertCircle className="text-red-500" size={28} />
        <h1 className="font-semibold text-text">Could not load this sale</h1>
        <button
          type="button"
          onClick={() => void saleQuery.refetch()}
          className="rounded-input bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link to="/sales" className="block text-sm text-primary">
          Back to sales
        </Link>
      </main>
    );
  }

  const balance = Math.max(0, sale.total_amount - sale.total_amount_paid);
  const status =
    sale.total_amount_paid >= sale.total_amount
      ? STATUS.paid
      : sale.total_amount_paid > 0
        ? STATUS.partial
        : STATUS.unpaid;

  return (
    <main className="space-y-6 pb-8">
      {/* Screen-only actions */}
      <div className="mx-auto flex max-w-md flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/sales"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft size={18} />
          Back to sales
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-input bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Printer size={17} />
          Print receipt
        </button>
      </div>

      {/* The receipt */}
      <section
        id="sale-receipt"
        className="mx-auto max-w-md drop-shadow-sm print:max-w-none print:drop-shadow-none"
      >
        <Teeth id="receipt-teeth-top" flip />

        <div className="-my-px border-x border-border bg-surface px-6 py-8 font-mono text-[13px] leading-relaxed text-text sm:px-8 print:border-0 print:px-0">
          {/* Store */}
          <header className="text-center">
            <h1 className="font-sans text-xl font-bold tracking-tight">
              {sale.store?.name ?? "Store name unavailable"}
            </h1>

            <div className="mt-2 text-text-muted">
              {sale.store?.address && <p>{sale.store.address}</p>}
              {sale.store?.zip_code && (
                <p>Postal code: {sale.store.zip_code}</p>
              )}
              {sale.store?.phone && <p>Tel: {sale.store.phone}</p>}
              {sale.store?.email && (
                <p className="break-all">{sale.store.email}</p>
              )}
            </div>

            <p className="mt-5 font-sans text-sm font-semibold uppercase tracking-[0.25em]">
              Sales receipt
            </p>
          </header>

          <Divider />

          {/* Sale info */}
          <div className="space-y-1">
            <Line label="Receipt no." value={sale.reference} />
            <Line
              label="Date"
              value={new Date(sale.generated_at).toLocaleDateString("en-NG", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
            <Line
              label="Served by"
              value={`${sale.generated_by.first_name} ${sale.generated_by.last_name}`}
            />
          </div>

          <Divider />

          {/* Customer */}
          <div>
            <p className="text-text-muted">Billed to</p>
            <p className="mt-1 font-semibold">{sale.customer.name}</p>
            <p className="text-text-muted">{sale.customer.phone}</p>
            {sale.customer.email && (
              <p className="break-all text-text-muted">{sale.customer.email}</p>
            )}
            {sale.customer.address && (
              <p className="whitespace-pre-line text-text-muted">
                {sale.customer.address}
              </p>
            )}
          </div>

          <Divider />

          {/* Items */}
          <p className="mb-3 text-text-muted">Items ({sale.items.length})</p>

          <ul className="space-y-3">
            {sale.items.map((item) => (
              <li key={item.id}>
                <div className="flex justify-between gap-4">
                  <span className="min-w-0 wrap-break-word font-semibold">
                    {item.product?.name ?? "Product"}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {money(item.subtotal)}
                  </span>
                </div>
                <p className="tabular-nums text-text-muted">
                  {item.quantity} × {money(item.unit_price)}
                </p>
                {item.product?.sku && (
                  <p className="text-xs text-text-muted">
                    SKU: {item.product.sku}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <Divider />

          {/* Totals */}
          <div className="space-y-1">
            <Line label="Total" value={money(sale.total_amount)} strong />
            <Line label="Paid" value={money(sale.total_amount_paid)} />
            <Line label="Balance due" value={money(balance)} strong />
          </div>

          <div className="mt-6 flex justify-center">
            <span
              className={`-rotate-6 rounded-md border-2 px-4 py-1 font-sans text-lg font-extrabold uppercase tracking-widest ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <Divider />

          {/* Payments */}
          <p className="mb-3 text-text-muted">Payments</p>

          {sale.payments.length === 0 ? (
            <p className="text-text-muted">No payments recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {sale.payments.map((payment) => (
                <li key={payment.id}>
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold capitalize">
                      {payment.method}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {money(payment.amount)}
                    </span>
                  </div>
                  <p className="break-all text-xs text-text-muted">
                    Ref: {payment.reference}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <Divider />

          <footer className="text-center">
            <p className="font-sans font-semibold">
              Thank you for your business.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Please keep this receipt for your records.
            </p>
          </footer>
        </div>

        <Teeth id="receipt-teeth-bottom" />
      </section>

      {/* Actions: never printed */}
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-2 print:hidden">
        <section className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-4 text-lg font-semibold text-text">Pay invoice</h2>

          <PayInvoiceForm
            balance={balance}
            isPending={updateSale.isPending}
            onSubmit={handlePayment}
          />
        </section>

        <section className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-4 text-lg font-semibold text-text">Add items</h2>

          <AddItemsForm
            products={products.data?.data ?? []}
            isLoading={products.isLoading}
            isPending={updateSale.isPending}
            search={productSearch}
            onSearchChange={setProductSearch}
            onSubmit={handleAddItems}
          />
        </section>
      </div>
    </main>
  );
}
