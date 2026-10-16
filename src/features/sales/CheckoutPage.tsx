import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useProducts } from "../products/useProduct";
import type IProduct from "../products/types/product.types";
import { useCheckoutCart } from "./useCheckoutCart";
// import type { CreateSalePayload, IInvoice } from "../../types/sale.types";
import { useCreateSale } from "./useCreateSale";
import type { ICheckoutDetails } from "./components/CheckoutDetailsForm";
import CheckoutDetailsForm from "./components/CheckoutDetailsForm";
import type { CreateSalePayload, IInvoice } from "./types/sale.types";

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CheckoutPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [completedSale, setCompletedSale] = useState<IInvoice | null>(null);
  const createSale = useCreateSale();

  const debouncedSearch = useDebouncedValue(search, 300);
  const { data, isPending, isError, refetch, isFetching } = useProducts(
    page,
    debouncedSearch,
    4,
  );

  const {
    items,
    totalAmount,
    addProduct,
    updateQuantity,
    removeProduct,
    clearCart,
  } = useCheckoutCart();

  const products = data?.data ?? [];

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleAddProduct(product: IProduct) {
    if (!product.is_active || product.quantity <= 0) return;

    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem && existingItem.quantity >= product.quantity) return;

    addProduct(product);
  }

  function handleCheckout(details: ICheckoutDetails) {
    if (items.length === 0 || createSale.isPending) return;

    const amountPaid = Number(details.amount_paid);

    if (
      !Number.isFinite(amountPaid) ||
      amountPaid < 0 /*||
      amountPaid > totalAmount*/
    ) {
      return;
    }

    const payload: CreateSalePayload = {
      items: items.map(({ product, quantity }) => ({
        product_id: product.id,
        quantity,
      })),
      customer_name: details.customer_name.trim(),
      customer_phone: details.customer_phone.trim(),
      amount_paid: amountPaid,
      ...(amountPaid > 0 && {
        payment_method: details.payment_method,
      }),
      ...(details.due_date && {
        due_date: details.due_date,
      }),
      ...(details.customer_email.trim() && {
        customer_email: details.customer_email.trim(),
      }),
      ...(details.customer_address.trim() && {
        customer_address: details.customer_address.trim(),
      }),
      ...(details.customer_lga_id && {
        customer_lga_id: details.customer_lga_id,
      }),
    };

    createSale.mutate(payload, {
      onSuccess: (response) => {
        setCompletedSale(response);
        clearCart();
      },
    });
  }

  const receipt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    receipt.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [completedSale]);

  return (
    <main className="space-y-6 pb-8">
      {completedSale && (
        <section
          ref={receipt}
          aria-live="polite"
          className="rounded-card border border-border bg-surface p-5"
        >
          <h2 className="text-xl font-bold text-text">Sale completed</h2>
          <p className="mt-2 text-sm text-text-muted">
            Sale reference: {completedSale.id}
          </p>

          <div className="mt-4 space-y-3">
            {completedSale.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium text-text">{item.product.name}</p>
                  <p className="text-text-muted">
                    {item.quantity} × ₦{item.unit_price.toLocaleString("en-NG")}
                  </p>
                </div>
                <p className="font-medium text-text">
                  ₦{item.subtotal.toLocaleString("en-NG")}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-text-muted">Total</span>
              <span className="font-semibold text-text">
                ₦{completedSale.total_amount.toLocaleString("en-NG")}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text-muted">Paid</span>
              <span className="text-text">
                ₦{completedSale.total_amount_paid.toLocaleString("en-NG")}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text-muted">Balance</span>
              <span className="font-semibold text-text">
                ₦
                {(
                  completedSale.total_amount - completedSale.total_amount_paid
                ).toLocaleString("en-NG")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCompletedSale(null)}
            className="mt-5 rounded-input bg-primary px-4 py-3 text-sm font-semibold text-white"
          >
            Start next sale
          </button>
        </section>
      )}

      <header>
        <h1 className="text-2xl font-bold text-text">Checkout</h1>
        <p className="mt-1 text-sm text-text-muted">
          Select products and prepare a sale.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="min-w-0 space-y-4">
          <div className="relative">
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by product name or SKU"
              aria-label="Search products"
              className="w-full rounded-input border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          {isPending ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-card border border-border bg-surface"
                />
              ))}
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="rounded-card border border-border bg-surface p-6 text-center"
            >
              <AlertCircle
                size={26}
                aria-hidden="true"
                className="mx-auto text-danger"
              />
              <p className="mt-2 font-medium text-text">
                Couldn't load products
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 rounded-input bg-primary px-4 py-2 text-sm font-medium text-white"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-text-muted">
                  {data?.meta.total ?? 0} matching products
                </p>
                {isFetching && (
                  <span className="text-xs text-text-muted">Updating…</span>
                )}
              </div>

              {products.length === 0 ? (
                <div className="rounded-card border border-border bg-surface p-6 text-center text-sm text-text-muted">
                  No products found. Try another search.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.map((product) => {
                    const selectedItem = items.find(
                      (item) => item.product.id === product.id,
                    );
                    const unavailable =
                      !product.is_active || product.quantity <= 0;
                    const atStockLimit =
                      !!selectedItem &&
                      selectedItem.quantity >= product.quantity;

                    return (
                      <article
                        key={product.id}
                        className="rounded-card border border-border bg-surface p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate font-semibold text-text">
                              {product.name}
                            </h2>
                            <p className="mt-1 text-xs text-text-muted">
                              SKU: {product.sku || "—"}
                            </p>
                          </div>
                          <p className="shrink-0 font-semibold text-text">
                            {formatCurrency(product.selling_price)}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-xs text-text-muted">
                            Stock: {product.quantity}
                          </p>
                          <button
                            type="button"
                            disabled={unavailable || atStockLimit}
                            onClick={() => handleAddProduct(product)}
                            className="inline-flex items-center gap-1 rounded-input bg-primary px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={16} aria-hidden="true" />
                            {atStockLimit ? "Stock limit" : "Add"}
                          </button>
                        </div>

                        {unavailable && (
                          <p className="mt-2 text-xs text-text-muted">
                            {product.is_active
                              ? "Out of stock"
                              : "Inactive product"}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              {data && data.meta.last_page > 1 && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-input border border-border px-3 py-2 text-sm text-text disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-text-muted">
                    Page {data.meta.current_page} of {data.meta.last_page}
                  </span>
                  <button
                    type="button"
                    disabled={page >= data.meta.last_page || isFetching}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-input border border-border px-3 py-2 text-sm text-text disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="h-fit min-w-0 rounded-card border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingCart
                size={20}
                aria-hidden="true"
                className="text-text"
              />
              <h2 className="text-lg font-semibold text-text">Cart</h2>
              <span className="rounded-full bg-background px-2 py-1 text-xs text-text-muted">
                {items.reduce((count, item) => count + item.quantity, 0)}
              </span>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-sm text-danger hover:opacity-80"
              >
                Clear
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="py-10 text-center">
              <ShoppingCart
                size={30}
                aria-hidden="true"
                className="mx-auto text-text-muted"
              />
              <p className="mt-3 text-sm font-medium text-text">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Add products to start a sale.
              </p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-border">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="space-y-3 py-4 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-text">{product.name}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {formatCurrency(product.selling_price)} each
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      aria-label={`Remove ${product.name}`}
                      className="rounded-input p-1 text-text-muted hover:text-danger"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Decrease ${product.name} quantity`}
                        disabled={quantity <= 1}
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="rounded-input border border-border p-2 text-text disabled:opacity-40"
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-medium text-text">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${product.name} quantity`}
                        disabled={quantity >= product.quantity}
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="rounded-input border border-border p-2 text-text disabled:opacity-40"
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                    <p className="font-semibold text-text">
                      {formatCurrency(product.selling_price * quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-text-muted">Total</span>
              <span className="text-xl font-bold text-text">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Stock and prices will be validated by the server when the sale is
              submitted.
            </p>
          </div>
        </aside>
      </div>
      <CheckoutDetailsForm
        totalAmount={totalAmount}
        onSubmit={handleCheckout}
        isSubmitting={createSale.isPending}
        isCartEmpty={items.length === 0}
      />
    </main>
  );
}
