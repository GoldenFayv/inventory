import { Link } from "react-router-dom";
import { ArrowRight, Clock3, HandCoins } from "lucide-react";
import type { IInvoice } from "../sales/types/sale.types";

type OutstandingCreditListProps = {
  invoices: IInvoice[];
  totalOutstanding: number;
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function OutstandingCreditList({
  invoices,
  // totalOutstanding
}: OutstandingCreditListProps) {
  const outstandingInvoices = invoices
    .filter((invoice) => invoice.total_amount > invoice.total_amount_paid)
    .sort(
      (a, b) =>
        b.total_amount -
        b.total_amount_paid -
        (a.total_amount - a.total_amount_paid),
    );

  const totalOutstanding = outstandingInvoices.reduce(
    (total, invoice) =>
      total + invoice.total_amount - invoice.total_amount_paid,
    0,
  );

  return (
    <section
      aria-labelledby="outstanding-credit-heading"
      className="rounded-card border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="outstanding-credit-heading"
            className="text-lg font-bold text-text"
          >
            Outstanding credit
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Recent invoices with unpaid balances
          </p>
        </div>

        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-warning">
          <HandCoins size={20} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-background p-4">
        <p className="text-sm text-text-muted">Outstanding in this list</p>
        <p className="mt-1 text-2xl font-bold text-text">
          {currencyFormatter.format(totalOutstanding)}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {outstandingInvoices.length} unpaid invoice
          {outstandingInvoices.length === 1 ? "" : "s"}
        </p>
      </div>

      {outstandingInvoices.length === 0 ? (
        <div className="py-8 text-center">
          <Clock3
            size={28}
            className="mx-auto text-text-muted"
            aria-hidden="true"
          />
          <p className="mt-3 font-semibold text-text">
            No outstanding invoices in this list
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Unpaid balances will appear here when available.
          </p>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {outstandingInvoices.slice(0, 5).map((invoice) => {
            const balance = invoice.total_amount - invoice.total_amount_paid;

            return (
              <li key={invoice.id}>
                <Link
                  to={`/sales/${invoice.id}`}
                  className="flex min-h-16 items-center justify-between gap-3 py-4 hover:bg-background"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-text">
                      {invoice.customer.name || "Walk-in customer"}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {invoice.reference}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-warning">
                        {currencyFormatter.format(balance)}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        Balance due
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-text-muted"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        to="/sales"
        className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-input border border-border px-4 py-3 font-medium text-primary hover:bg-primary-light"
      >
        View all sales
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}
