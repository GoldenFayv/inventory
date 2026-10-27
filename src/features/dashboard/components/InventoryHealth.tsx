import { Package, PackageSearch, CircleAlert } from "lucide-react";
import { Link } from "react-router-dom";

type InventoryHealthProps = {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
};

const metrics = [
  {
    key: "totalProducts",
    label: "Active products",
    description: "Products in your inventory",
    icon: Package,
    color: "text-primary",
    bg: "bg-primary-light",
  },
  {
    key: "lowStockCount",
    label: "Low stock",
    description: "Products to restock soon",
    icon: PackageSearch,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    key: "outOfStockCount",
    label: "Out of stock",
    description: "Products with no stock",
    icon: CircleAlert,
    color: "text-danger",
    bg: "bg-danger/10",
  },
] as const;

export default function InventoryHealth({
  totalProducts,
  lowStockCount,
  outOfStockCount,
}: InventoryHealthProps) {
  const values = {
    totalProducts,
    lowStockCount,
    outOfStockCount,
  };

  return (
    <section className="space-y-3" aria-labelledby="inventory-health-heading">
      <div>
        <h2
          id="inventory-health-heading"
          className="text-lg font-bold text-text"
        >
          Inventory health
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Know what is available and what needs restocking.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const value = values[metric.key].toLocaleString("en-NG");

          return (
            <Link
              key={metric.key}
              to="/products"
              aria-label={`${metric.label}: ${value}. View products`}
              className="flex min-w-0 items-center gap-3 rounded-card border border-border bg-surface p-4 transition hover:bg-background sm:flex-col sm:items-start sm:gap-4"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${metric.bg} ${metric.color}`}
              >
                <Icon size={20} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1 sm:order-2 sm:flex-none">
                <p className="text-sm font-medium text-text">{metric.label}</p>
                <p className="mt-0.5 text-xs leading-5 text-text-muted">
                  {metric.description}
                </p>
              </div>

              <p className="text-2xl font-bold tabular-nums text-text sm:order-1">
                {value}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
