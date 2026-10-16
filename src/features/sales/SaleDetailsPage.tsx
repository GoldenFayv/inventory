import { useParams, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";
import { useSale, useUpdateSale } from "./useSales";
import AddItemsForm from "./components/AddItemsForm";
import PayInvoiceForm from "./components/PayInvoiceForm";
import { useProducts } from "../products/useProduct";
import { useEffect, useState } from "react";

const money = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

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

  if (saleQuery.isLoading) {
    return <p>Loading invoice...</p>;
  }

  // if (saleQuery.isError || !sale) {
  //   return <p>Unable to load invoice.</p>;
  // }
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

  return (
    <main className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
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
          className="inline-flex items-center gap-2 rounded-input bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Printer size={17} />
          Print receipt
        </button>
      </div>

      <section
        id="sale-receipt"
        className="mx-auto max-w-3xl overflow-hidden rounded-card border border-border bg-surface print:max-w-none print:rounded-none print:border-0"
      >
        {/* Invoice heading */}
        <header className="border-b border-border p-5 sm:p-8 print:p-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Sales invoice
              </p>

              <h1 className="mt-3 text-2xl font-bold text-text">
                {sale.store?.name ?? "Store name unavailable"}
              </h1>

              {sale.store?.address && (
                <p className="mt-2 max-w-sm text-sm text-text-muted">
                  {sale.store.address}
                </p>
              )}

              {sale.store?.phone && (
                <p className="mt-1 text-sm text-text-muted">
                  Phone: {sale.store.phone}
                </p>
              )}

              {sale.store?.email && (
                <p className="text-sm text-text-muted">{sale.store.email}</p>
              )}

              {sale.store?.zip_code && (
                <p className="text-sm text-text-muted">
                  Postal code: {sale.store.zip_code}
                </p>
              )}
            </div>

            <div className="sm:min-w-52 sm:text-right">
              <h2 className="text-xl font-bold text-text">INVOICE</h2>

              <p className="mt-2 break-all text-sm text-text">
                <span className="text-text-muted">Invoice no:</span>{" "}
                {sale.reference}
              </p>

              <p className="mt-1 text-sm text-text">
                <span className="text-text-muted">Date issued:</span>{" "}
                {new Date(sale.generated_at).toLocaleDateString("en-NG", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <p className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-xs font-semibold text-text">
                {sale.total_amount_paid >= sale.total_amount
                  ? "PAID"
                  : sale.total_amount_paid > 0
                    ? "PARTIALLY PAID"
                    : "UNPAID"}
              </p>
            </div>
          </div>
        </header>

        {/* Customer information */}
        <section className="grid gap-5 border-b border-border p-5 sm:grid-cols-2 sm:p-8 print:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Bill to
            </p>

            <h2 className="mt-2 font-semibold text-text">
              {sale.customer.name}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              {sale.customer.phone}
            </p>

            {sale.customer.email && (
              <p className="mt-1 break-all text-sm text-text-muted">
                {sale.customer.email}
              </p>
            )}

            {sale.customer.address && (
              <p className="mt-1 whitespace-pre-line text-sm text-text-muted">
                {sale.customer.address}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Sale information
            </p>

            <p className="mt-2 text-sm text-text">
              <span className="text-text-muted">Reference:</span>{" "}
              {sale.reference}
            </p>

            <p className="mt-1 text-sm text-text">
              <span className="text-text-muted">Served by:</span>{" "}
              {sale.generated_by.first_name} {sale.generated_by.last_name}
            </p>
          </div>
        </section>

        {/* Itemized invoice */}
        <section className="p-5 sm:p-8 print:p-6">
          <h2 className="mb-4 font-semibold text-text">Items and charges</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-115 text-left text-sm">
              <thead>
                <tr className="border-y border-border bg-background">
                  <th className="px-3 py-3 font-semibold text-text">Item</th>
                  <th className="px-3 py-3 text-right font-semibold text-text">
                    Qty
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-text">
                    Unit price
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-text">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="px-3 py-4 text-text">
                      <p className="font-medium">
                        {item.product?.name ?? "Product"}
                      </p>

                      {item.product?.sku && (
                        <p className="mt-1 text-xs text-text-muted">
                          SKU: {item.product.sku}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-4 text-right text-text">
                      {item.quantity}
                    </td>

                    <td className="px-3 py-4 text-right text-text">
                      {money(item.unit_price)}
                    </td>

                    <td className="px-3 py-4 text-right font-medium text-text">
                      {money(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="ml-auto mt-6 max-w-sm space-y-3">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-text-muted">Subtotal</span>
              <span className="text-text">{money(sale.total_amount)}</span>
            </div>

            <div className="flex justify-between gap-4 border-t border-border pt-3 text-sm">
              <span className="text-text-muted">Total due</span>
              <span className="font-bold text-text">
                {money(sale.total_amount)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-text-muted">Total paid</span>
              <span className="font-medium text-text">
                {money(sale.total_amount_paid)}
              </span>
            </div>

            <div className="flex justify-between gap-4 rounded-input bg-background p-3">
              <span className="text-sm font-semibold text-text">
                Balance outstanding
              </span>
              <span className="font-bold text-text">
                {money(Math.max(0, sale.total_amount - sale.total_amount_paid))}
              </span>
            </div>
          </div>
        </section>

        {/* Payment records */}
        <section className="border-t border-border p-5 sm:p-8 print:p-6">
          <h2 className="font-semibold text-text">Payment records</h2>

          {sale.payments.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">
              No payments have been recorded for this invoice.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {sale.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-wrap justify-between gap-3 border-b border-border pb-3 text-sm last:border-0"
                >
                  <div>
                    <p className="font-medium capitalize text-text">
                      {payment.method}
                    </p>
                    <p className="mt-1 break-all text-xs text-text-muted">
                      Payment reference: {payment.reference}
                    </p>
                  </div>

                  <p className="font-semibold text-text">
                    {money(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2 p-4">
          <section className="rounded-card border border-border bg-surface p-4">
            <h2 className="mb-4 text-lg font-semibold text-text">
              Pay invoice
            </h2>

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

        <footer className="border-t border-border bg-background p-5 text-center sm:p-8 print:bg-white print:p-6">
          <p className="font-semibold text-text">
            Thank you for your business.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Please keep this invoice for your records.
          </p>
        </footer>
      </section>
    </main>
  );
}
