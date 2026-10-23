import { memo } from "react";
import { Package, PackagePlus, Pencil } from "lucide-react";
import { getStockStatus } from "../utils/getStockStatus";
import type IProduct from "../types/product.types";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";
import { Link } from "react-router-dom";
import { useToogleStatus } from "../useProduct";

interface ProductCardProps {
  product: IProduct;
  onRestock: (product: IProduct) => void;
}

type StockStatus = ReturnType<typeof getStockStatus>;

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

const STOCK_STYLES: Record<StockStatus, string> = {
  out: "bg-danger/10 text-danger",
  low: "bg-warning/10 text-warning",
  "in-stock": "bg-success/10 text-success",
};

const STOCK_LABELS: Record<StockStatus, string> = {
  out: "Out of stock",
  low: "Low stock",
  "in-stock": "In stock",
};

function ProductCard({ product, onRestock }: ProductCardProps) {
  const { id, name, sku, is_active, selling_price, cost_price, quantity } =
    product;

  // const queryClient = useQueryClient();

  // const {
  //   mutate: toggleStatus,
  //   isPending,
  //   isError,
  // } = useMutation({
  //   mutationFn: () => productService.toggleStatus(id),
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  // });

  const toggleStatus = useToogleStatus();

  // const handleToggle = useCallback(() => toggleStatus(), [toggleStatus]);

  const stockStatus = getStockStatus(product);

  return (
    <article className="min-w-0 rounded-card border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
          {product.media?.length > 0 && product.media[0].url ? (
            <img
              src={product.media[0].url}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <Package size={22} aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-text">{name}</h2>
          <p className="mt-1 truncate text-sm text-text-muted">
            SKU: {sku || "Not assigned"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`whitespace-nowrap text-sm font-medium ${
              is_active ? "text-green-600" : "text-text-muted"
            }`}
          >
            {/* {is_active ? "Active" : "Inactive"} */}
          </span>

          <ToggleSwitch
            checked={is_active}
            label={`${is_active ? "Deactivate" : "Activate"} ${name}`}
            disabled={toggleStatus.isPending}
            onChange={() => toggleStatus.mutate(id)}
          />
        </div>

        <Link
          to={`/products/${product.id}/edit`}
          aria-label={`Edit ${product.name}`}
          title="Edit product"
          className="rounded-lg p-2 text-text-muted transition hover:bg-background hover:text-primary"
        >
          <Pencil size={18} aria-hidden="true" />
        </Link>
      </div>

      {toggleStatus.isError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          Failed to update product status. Please try again.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-text-muted">Selling price</p>
          <p className="mt-1 font-semibold text-text">
            {currency.format(selling_price)}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-muted">Cost price</p>
          <p className="mt-1 font-semibold text-text">
            {currency.format(cost_price)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="text-xs text-text-muted">Quantity</p>
          <p className="mt-1 font-semibold text-text">{quantity}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STOCK_STYLES[stockStatus]}`}
        >
          {STOCK_LABELS[stockStatus]}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onRestock(product)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-input border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary-light"
      >
        <PackagePlus size={17} aria-hidden="true" />
        Restock
      </button>
    </article>
  );
}

export default memo(ProductCard);
