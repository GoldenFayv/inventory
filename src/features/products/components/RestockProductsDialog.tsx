import { useMemo, useState } from "react";
import { X, Plus, Trash2, PackagePlus, Search } from "lucide-react";
import type IProduct from "../types/product.types";
import type { RestockProductItem } from "../types/product.types";
import { useProducts } from "../useProduct";

interface RestockProductsDialogProps {
  initialProduct: IProduct;
  onClose: () => void;
  onSubmit: (items: RestockProductItem[]) => void;
  isPending: boolean;
  error: string | null;
}

export default function RestockProductsDialog({
  initialProduct,
  onClose,
  onSubmit,
  isPending,
  error,
}: RestockProductsDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([
    initialProduct,
  ]);

  const [quantities, setQuantities] = useState<Record<string, string>>({
    [String(initialProduct.id)]: "1",
  });
  const [search, setSearch] = useState("");

  const trimmedSearch = search.trim();

  const {
    data: searchResults,
    isFetching,
    isError: searchError,
  } = useProducts(1, trimmedSearch, 10, 15_000);

  // Latest server data, keyed by id
  const freshById = useMemo(
    () => new Map((searchResults?.data ?? []).map((p) => [String(p.id), p])),
    [searchResults],
  );

  // Selected products with fresh data layered on top
  const displayProducts = useMemo(
    () =>
      selectedProducts.map(
        (selected) => freshById.get(String(selected.id)) ?? selected,
      ),
    [selectedProducts, freshById],
  );

  const selectedIds = new Set(
    selectedProducts.map((product) => String(product.id)),
  );

  const availableProducts = (searchResults?.data ?? []).filter(
    (product) => !selectedIds.has(String(product.id)),
  );

  function addProduct(product: IProduct) {
    setSelectedProducts((current) => [...current, product]);
    setQuantities((current) => ({
      ...current,
      [String(product.id)]: "1",
    }));
    setSearch("");
  }

  function removeProduct(productId: string) {
    setSelectedProducts((current) =>
      current.filter((product) => String(product.id) !== productId),
    );

    setQuantities((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }

  function zeroAllQuantities() {
    setQuantities((current) =>
      Object.fromEntries(Object.keys(current).map((id) => [id, "0"])),
    );
  }

  const hasInvalidQuantity =
    selectedProducts.length === 0 ||
    selectedProducts.some((product) => {
      const quantity = Number(quantities[String(product.id)]);
      return !Number.isSafeInteger(quantity) || quantity <= 0;
    });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasInvalidQuantity || isPending) return;

    onSubmit(
      selectedProducts.map((product) => ({
        product_id: String(product.id),
        quantity: Number(quantities[String(product.id)]),
      })),
    );

    zeroAllQuantities();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="restock-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 shadow-xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <PackagePlus size={22} />
              <h2 id="restock-title" className="text-lg font-bold text-text">
                Restock products
              </h2>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Search for products and enter the additional quantities.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close restock dialog"
            className="rounded-lg p-2 text-text-muted hover:bg-background"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {displayProducts.map((product) => {
            const productId = String(product.id);

            return (
              <div
                key={productId}
                className="rounded-xl border border-border p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-text">{product.name}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Current stock: {product.quantity}
                    </p>
                  </div>

                  {selectedProducts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(productId)}
                      disabled={isPending}
                      aria-label={`Remove ${product.name}`}
                      className="rounded-lg p-2 text-danger hover:bg-background"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <label className="mt-3 block text-sm font-medium text-text">
                  Quantity to add
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quantities[productId] ?? ""}
                    onChange={(event) =>
                      setQuantities((current) => ({
                        ...current,
                        [productId]: event.target.value,
                      }))
                    }
                    disabled={isPending}
                    className="mt-1 w-full rounded-input border border-border bg-background px-3 py-2 text-text"
                  />
                </label>
              </div>
            );
          })}

          <div>
            <label
              htmlFor="restock-product-search"
              className="mb-1 block text-sm font-medium text-text"
            >
              Add another product
            </label>

            <div className="flex items-center gap-2 rounded-input border border-border bg-background px-3">
              <Search size={17} className="shrink-0 text-text-muted" />
              <input
                id="restock-product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by product name or SKU…"
                disabled={isPending}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-text outline-none"
              />
            </div>

            {trimmedSearch.length > 0 && trimmedSearch.length < 2 && (
              <p className="mt-2 text-xs text-text-muted">
                Enter at least 2 characters to search.
              </p>
            )}

            {trimmedSearch.length >= 2 && (
              <div className="mt-2 overflow-hidden rounded-xl border border-border">
                {isFetching ? (
                  <p className="p-3 text-sm text-text-muted">
                    Searching products…
                  </p>
                ) : searchError ? (
                  <p role="alert" className="p-3 text-sm text-danger">
                    Could not search products. Please try again.
                  </p>
                ) : availableProducts.length > 0 ? (
                  availableProducts.map((product) => (
                    <button
                      key={String(product.id)}
                      type="button"
                      onClick={() => addProduct(product)}
                      disabled={isPending}
                      className="flex w-full items-center justify-between gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-background"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-text">
                          {product.name}
                        </span>
                        <span className="block text-xs text-text-muted">
                          SKU: {product.sku || "Not assigned"} · Stock:{" "}
                          {product.quantity}
                        </span>
                      </span>
                      <Plus size={18} className="shrink-0 text-primary" />
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-sm text-text-muted">
                    No more matching products found.
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <footer className="flex gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-input border border-border px-4 py-3 text-sm font-medium text-text disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending || hasInvalidQuantity}
              className="flex-1 rounded-input bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isPending ? "Restocking…" : "Confirm restock"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
