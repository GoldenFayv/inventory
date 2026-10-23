import type { IInvoice } from "../types/sale.types";
import { formatDate, getBalance, getPaymentStatus, money } from "../utils/sale";

export default function SaleInvoice({ sale }: { sale: IInvoice }) {
  const status = getPaymentStatus(sale);
  const balance = getBalance(sale);

  return (
    <section
      id="sale-invoice"
      className="mx-auto max-w-3xl overflow-hidden rounded-card border border-border bg-surface shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none"
    >
      <div className="h-1.5 bg-primary print:h-1" />

      {/* Header */}
      <header className="flex flex-col justify-between gap-6 border-b border-border p-5 sm:flex-row sm:p-8 print:p-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-text">
            {sale.store?.name ?? "Store name unavailable"}
          </h1>

          <div className="mt-2 max-w-xs space-y-0.5 text-sm text-text-muted">
            {sale.store?.address && <p>{sale.store.address}</p>}
            {sale.store?.zip_code && <p>Postal code: {sale.store.zip_code}</p>}
            {sale.store?.phone && <p>Phone: {sale.store.phone}</p>}
            {sale.store?.email && (
              <p className="break-all">{sale.store.email}</p>
            )}
          </div>
        </div>

        <div className="sm:text-right">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">
            Invoice
          </h2>

          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-text-muted">Invoice no.</dt>
              <dd className="break-all font-medium text-text">
                {sale.reference}
              </dd>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-text-muted">Date issued</dt>
              <dd className="font-medium text-text">
                {formatDate(sale.generated_at)}
              </dd>
            </div>
          </dl>

          <p
            className={`mt-3 inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${status.tone}`}
          >
            {status.label}
          </p>
        </div>
      </header>

      {/* Parties */}
      <div className="grid gap-6 border-b border-border p-5 sm:grid-cols-2 sm:p-8 print:p-6">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-muted">Billed to</h3>
          <p className="mt-2 font-semibold text-text">{sale.customer.name}</p>
          <p className="mt-1 text-sm text-text-muted">{sale.customer.phone}</p>
          {sale.customer.email && (
            <p className="mt-0.5 break-all text-sm text-text-muted">
              {sale.customer.email}
            </p>
          )}
          {sale.customer.address && (
            <p className="mt-0.5 whitespace-pre-line text-sm text-text-muted">
              {sale.customer.address}
            </p>
          )}
        </div>

        <div className="sm:text-right">
          <h3 className="text-sm font-semibold text-text-muted">
            Sale details
          </h3>
          <p className="mt-2 text-sm text-text">
            <span className="text-text-muted">Served by:</span>{" "}
            {sale.generated_by.first_name} {sale.generated_by.last_name}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="p-5 sm:p-8 print:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-115 text-left text-sm">
            <thead>
              <tr className="border-b-2 border-text/80">
                <th className="py-2.5 pr-3 font-semibold text-text">
                  Description
                </th>
                <th className="px-3 py-2.5 text-right font-semibold text-text">
                  Qty
                </th>
                <th className="px-3 py-2.5 text-right font-semibold text-text">
                  Unit price
                </th>
                <th className="py-2.5 pl-3 text-right font-semibold text-text">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-3.5 pr-3 text-text">
                    <p className="font-medium">
                      {item.product?.name ?? "Product"}
                    </p>
                    {item.product?.sku && (
                      <p className="mt-0.5 text-xs text-text-muted">
                        SKU: {item.product.sku}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-text">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-text">
                    {money(item.unit_price)}
                  </td>
                  <td className="py-3.5 pl-3 text-right font-medium tabular-nums text-text">
                    {money(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">Total</span>
            <span className="font-semibold tabular-nums text-text">
              {money(sale.total_amount)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-text-muted">Amount paid</span>
            <span className="tabular-nums text-text">
              {money(sale.total_amount_paid)}
            </span>
          </div>

          <div className="flex justify-between gap-4 rounded-input bg-background px-3 py-2.5 print:border print:border-border">
            <span className="font-semibold text-text">Balance due</span>
            <span className="text-base font-bold tabular-nums text-text">
              {money(balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="border-t border-border p-5 sm:p-8 print:p-6">
        <h3 className="font-semibold text-text">Payment history</h3>

        {sale.payments.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">
            No payments have been recorded for this invoice.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border text-sm">
            {sale.payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium capitalize text-text">
                    {payment.method}
                  </p>
                  <p className="mt-0.5 break-all text-xs text-text-muted">
                    Reference: {payment.reference}
                  </p>
                </div>
                <p className="font-semibold tabular-nums text-text">
                  {money(payment.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="border-t border-border bg-background p-5 text-center sm:p-8 print:bg-white print:p-6">
        <p className="font-semibold text-text">Thank you for your business.</p>
        <p className="mt-1 text-xs text-text-muted">
          Please keep this invoice for your records.
        </p>
      </footer>
    </section>
  );
}
