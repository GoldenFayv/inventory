import { useMemo, useState } from "react";
import type IProduct from "../../products/types/product.types";

interface AddItemsFormProps {
  products: IProduct[];
  isLoading: boolean;
  isPending: boolean;
  onSubmit: (items: { product_id: string; quantity: number }[]) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const money = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);

export default function AddItemsForm({
  products,
  isLoading,
  isPending,
  onSubmit,
  onSearchChange,
  search,
}: AddItemsFormProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const availableProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.is_active &&
          product.quantity > 0 &&
          product.name.toLowerCase().includes(search.toLowerCase().trim()),
      ),
    [products, search],
  );

  const selectedItems = products.filter(
    (product) => (quantities[product.id] ?? 0) > 0,
  );

  const additionalTotal = selectedItems.reduce(
    (total, product) =>
      total + product.selling_price * (quantities[product.id] ?? 0),
    0,
  );

  function handleSubmit() {
    const items = selectedItems.map((product) => ({
      product_id: product.id,
      quantity: quantities[product.id],
    }));

    if (items.length === 0) return;

    onSubmit(items);
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="add-item-search" className="text-sm font-medium">
          Search products
        </label>
        <input
          id="add-item-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by product name"
          className="mt-1 w-full rounded-input border border-border bg-background px-3 py-2 text-text"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading products...</p>
      ) : (
        <div className="max-h-72 space-y-3 overflow-y-auto">
          {availableProducts.map((product) => {
            const quantity = quantities[product.id] ?? 0;

            return (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-card border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">
                    {product.name}
                  </p>
                  <p className="text-sm text-text-muted">
                    {money(product.selling_price)} · {product.quantity} in stock
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove one ${product.name}`}
                    disabled={quantity === 0}
                    onClick={() =>
                      setQuantities((current) => ({
                        ...current,
                        [product.id]: Math.max(
                          0,
                          (current[product.id] ?? 0) - 1,
                        ),
                      }))
                    }
                    className="rounded-input border border-border px-3 py-1.5 disabled:opacity-40"
                  >
                    −
                  </button>

                  <span className="w-6 text-center">{quantity}</span>

                  <button
                    type="button"
                    aria-label={`Add one ${product.name}`}
                    disabled={quantity >= product.quantity}
                    onClick={() =>
                      setQuantities((current) => ({
                        ...current,
                        [product.id]: (current[product.id] ?? 0) + 1,
                      }))
                    }
                    className="rounded-input border border-border px-3 py-1.5 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}

          {availableProducts.length === 0 && (
            <p className="text-sm text-text-muted">
              No available products match your search.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div>
          <p className="text-sm text-text-muted">Additional total</p>
          <p className="text-lg font-semibold text-text">
            {money(additionalTotal)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || selectedItems.length === 0}
          className="rounded-input bg-primary px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Adding items..." : "Add to invoice"}
        </button>
      </div>
    </div>
  );
}
