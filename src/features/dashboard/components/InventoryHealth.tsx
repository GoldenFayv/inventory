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
    bg: "bg-amber-50",
  },
  {
    key: "outOfStockCount",
    label: "Out of stock",
    description: "Products with no stock",
    icon: CircleAlert,
    color: "text-danger",
    bg: "bg-red-50",
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

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.key}
              className="flex min-w-0 items-start gap-3 rounded-card border border-border bg-surface p-4"
            >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${metric.bg} ${metric.color}`}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>

                  <Link to={"/products"}>
                <div className="min-w-0">
                  <p className="text-sm text-text-muted">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold text-text">
                    {values[metric.key].toLocaleString("en-NG")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-text-muted">
                    {metric.description}
                  </p>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
