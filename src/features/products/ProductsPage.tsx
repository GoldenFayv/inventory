import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import ProductList from "./components/ProductList";
import ProductPagination from "./components/ProductPagination";
import ProductSearch from "./components/ProductSearch";
import { useProducts, useRestockProduct } from "./useProduct";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RestockProductsDialog from "./components/RestockProductsDialog";
import type IProduct from "./types/product.types";
import RefreshButton from "../../components/ui/RefreshButton";

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

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [restockProduct, setRestockProduct] = useState<IProduct | null>(null);

  const useRestock = useRestockProduct();

  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isPending, isError, refetch, isFetching } = useProducts(
    page,
    debouncedSearch,
  );

  // useEffect(() => {
  //   setPage(1);
  // }, [debouncedSearch]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const products = data?.data ?? [];

  return (
    <main className="space-y-6 pb-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Products</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage your products and stock.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 rounded-input bg-primary px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus size={18} aria-hidden="true" />
            Add product
          </Link>

          <RefreshButton
            onRefresh={refetch}
            isRefreshing={isFetching}
            loadingLabel="Refreshing..."
          />
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">Total products</p>
          <p className="mt-2 text-2xl font-bold text-text">
            {data?.meta.total ?? "—"}
          </p>
        </div>

        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">Low stock on this page</p>
          <p className="mt-2 text-2xl font-bold text-text">
            {data?.data.filter(
              (product) =>
                product.quantity > 0 &&
                product.quantity <= product.low_stock_threshold,
            ).length ?? "—"}
          </p>
        </div>

        <div className="col-span-2 rounded-card border border-border bg-surface p-4 sm:col-span-1">
          <p className="text-sm text-text-muted">Out of stock on this page</p>
          <p className="mt-2 text-2xl font-bold text-text">
            {data?.data.filter((product) => product.quantity <= 0).length ??
              "—"}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <ProductSearch value={search} onChange={handleSearchChange} />

        {isPending ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-card border border-border bg-surface"
              />
            ))}
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="rounded-card border border-border bg-surface p-6 text-center"
          >
            <AlertCircle
              size={28}
              aria-hidden="true"
              className="mx-auto text-danger"
            />
            <h2 className="mt-3 font-semibold text-text">
              Couldn't load products
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-input bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-text-muted" aria-live="polite">
                {data?.meta.total ?? 0} matching products
              </p>

              {isFetching && (
                <span className="text-xs text-text-muted">Updating…</span>
              )}
            </div>

            <ProductList
              products={products}
              onRestock={(product) => {
                useRestock.reset();
                setRestockProduct(product);
              }}
            />

            {data && (
              <ProductPagination
                meta={data.meta}
                onPageChange={setPage}
                disabled={isFetching}
              />
            )}
          </>
        )}
      </section>

      {restockProduct && (
        <RestockProductsDialog
          key={String(restockProduct.id)}
          initialProduct={restockProduct}
          onClose={() => {
            if (!useRestock.isPending) {
              setRestockProduct(null);
              useRestock.reset();
            }
          }}
          onSubmit={(items) => useRestock.mutate(items)}
          isPending={useRestock.isPending}
          error={
            useRestock.isError ? "Restocking failed. Please try again." : null
          }
        />
      )}

      {/* /> */}
      {/* )} */}
    </main>
  );
}
