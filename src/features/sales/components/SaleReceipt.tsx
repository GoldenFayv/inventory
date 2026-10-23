import type { IInvoice } from "../types/sale.types";
import { formatDate, getBalance, getPaymentStatus, money } from "../utils/sale";

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

export default function SaleReceipt({ sale }: { sale: IInvoice }) {
  const status = getPaymentStatus(sale);
  const balance = getBalance(sale);

  return (
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
            {sale.store?.zip_code && <p>Postal code: {sale.store.zip_code}</p>}
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
          <Line label="Date" value={formatDate(sale.generated_at)} />
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
            className={`-rotate-6 rounded-md border-2 px-4 py-1 font-sans text-lg font-extrabold uppercase tracking-widest ${status.tone}`}
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
  );
}
