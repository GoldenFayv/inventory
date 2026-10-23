import { useState } from "react";
import {
  RefreshCw,
  WifiOff,
  ShoppingBag,
  Wallet,
  HandCoins,
  PackageSearch,
  Warehouse,
} from "lucide-react";

import SummaryCard from "./components/SummaryCard";
import QuickActions from "./components/QuickActions";
import LowStockList from "./components/LowStockList";
import { useDashboard } from "./useDashboard";
import InventoryHealth from "./components/InventoryHealth";
import { useLowStockProducts } from "../products/useProduct";
import { useOutstandingCredit, useRecentSales } from "../sales/useSales";
import RecentSales from "./components/RecentSales";
import OutstandingCreditList from "./OutstandingCreditList";

type DateMode = "today" | "single" | "range";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function DashboardPage() {
  const [dateMode, ] = useState<DateMode>("range");
  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [from, setFrom] = useState(getLocalDate);
  const [to, setTo] = useState("");

  const filters =
    dateMode === "single"
      ? { date: selectedDate }
      : dateMode === "range"
        ? { from, to }
        : {};

  const { data, isPending, isError, isFetching, refetch } =
    useDashboard(filters);

  const lowStockQuery = useLowStockProducts();
  const recentSalesQuery = useRecentSales();
  const outstandingCreditQuery = useOutstandingCredit();

  const periodLabel =
    dateMode === "today"
      ? "today"
      : dateMode === "single"
        ? `on ${formatDate(selectedDate)}`
        : `from ${formatDate(from)} to ${formatDate(to)}`;

  const headingDate =
    dateMode === "today"
      ? new Intl.DateTimeFormat("en-NG", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date())
      : dateMode === "single"
        ? formatDate(selectedDate)
        : `${formatDate(from)} – ${formatDate(to)}`;

  const cards = data
    ? ([
        {
          label: dateMode === "today" ? "Sales today" : "Sales",
          amount: data.summary.sales,
          description: `Total value of sales ${periodLabel}`,
          color: "primary",
          isCurrency: true,
          icon: ShoppingBag,
        },
        {
          label: "Money received",
          amount: data.summary.money_received,
          description: `Payments received ${periodLabel}`,
          color: "success",
          isCurrency: true,
          icon: Wallet,
        },
        {
          label: "Customers owe",
          amount: data.summary.outstanding_credit,
          description: "Outstanding credit balance",
          color: "warning",
          isCurrency: true,
          icon: HandCoins,
        },
        {
          label: "Low stock items",
          amount: data.summary.low_stock_count,
          description: "Products to restock",
          color: "danger",
          isCurrency: false,
          icon: PackageSearch,
        },
        {
          label: "Stock value",
          amount: data.summary.stock_value,
          description: "Estimated inventory cost",
          color: "success",
          isCurrency: true,
          icon: Warehouse,
        },
      ] as const)
    : [];

  if (isPending) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-border" />
          <div className="h-8 w-56 animate-pulse rounded bg-border" />
        </div>

        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-card border border-border bg-surface"
            />
          ))}
        </div>

        <p className="text-sm text-text-muted">Loading your shop summary...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <section className="rounded-card border border-border bg-surface p-5 sm:p-8">
        <WifiOff size={28} className="text-text-muted" />

        <h1 className="mt-4 text-xl font-bold">
          Couldn't load your shop summary
        </h1>

        <p className="mt-2 text-sm leading-6 text-text-muted">
          Check your internet connection and try again. Your figures haven't
          been replaced with sample data.
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-input bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-hover"
        >
          <RefreshCw size={18} />
          Try again
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-7">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">{headingDate}</p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Your shop at a glance
          </h1>

          <p className="mt-2 text-text-muted">
            Here's how your shop is doing {periodLabel}.
          </p>
        </div>

        <button
          type="button"
          aria-label="Refresh shop summary"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex size-11 shrink-0 items-center justify-center rounded-input border border-border bg-surface text-text-muted hover:bg-background disabled:opacity-50"
        >
          <RefreshCw size={19} className={isFetching ? "animate-spin" : ""} />
        </button>
      </header>

      <section
        aria-label="Dashboard date filter"
        className="space-y-4 rounded-card border border-border bg-surface p-4"
      >
        <div>
          <h2 className="font-semibold">View shop summary</h2>
          <p className="mt-1 text-sm text-text-muted">
            Choose the period for your sales and payment figures.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* <button
            type="button"
            onClick={() => setDateMode("today")}
            aria-pressed={dateMode === "today"}
            className={`min-h-10 rounded-input border px-4 py-2 text-sm font-medium ${
              dateMode === "today"
                ? "border-primary bg-primary text-white"
                : "border-border bg-background text-text hover:bg-surface"
            }`}
          >
            Today
          </button> */}

          {/* <button
            type="button"
            onClick={() => setDateMode("single")}
            aria-pressed={dateMode === "single"}
            className={`min-h-10 rounded-input border px-4 py-2 text-sm font-medium ${
              dateMode === "single"
                ? "border-primary bg-primary text-white"
                : "border-border bg-background text-text hover:bg-surface"
            }`}
          >
            Single date
          </button> */}

          {/* <button
            type="button"
            onClick={() => setDateMode("range")}
            aria-pressed={dateMode === "range"}
            className={`min-h-10 rounded-input border px-4 py-2 text-sm font-medium ${
              dateMode === "range"
                ? "border-primary bg-primary text-white"
                : "border-border bg-background text-text hover:bg-surface"
            }`}
          >
            Date range
          </button> */}
        </div>

        {dateMode === "single" && (
          <div className="max-w-sm space-y-2">
            <label
              htmlFor="dashboard-date"
              className="block text-sm font-medium"
            >
              Select date
            </label>

            <input
              id="dashboard-date"
              type="date"
              value={selectedDate}
              max={getLocalDate()}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="min-h-12 w-full rounded-input border border-border bg-background px-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {dateMode === "range" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="dashboard-from"
                className="block text-sm font-medium"
              >
                From
              </label>

              <input
                id="dashboard-from"
                type="date"
                value={from}
                max={to || getLocalDate()}
                onChange={(event) => {
                  const value = event.target.value;
                  setFrom(value);

                  if (value && to && value > to) {
                    setTo(value);
                  }
                }}
                className="min-h-12 w-full rounded-input border border-border bg-background px-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dashboard-to"
                className="block text-sm font-medium"
              >
                To
              </label>

              <input
                id="dashboard-to"
                type="date"
                value={to}
                min={from}
                max={getLocalDate()}
                onChange={(event) => setTo(event.target.value)}
                className="min-h-12 w-full rounded-input border border-border bg-background px-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {isFetching && (
          <p role="status" className="text-sm text-text-muted">
            Updating summary...
          </p>
        )}
      </section>

      <section aria-label="Shop summary">
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {cards.map((card) => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <QuickActions />

      <InventoryHealth
        totalProducts={data.summary.total_products}
        lowStockCount={data.summary.low_stock_count}
        outOfStockCount={data.summary.out_of_stock_count}
      />

      <LowStockList
        products={lowStockQuery.data ?? []}
        isLoading={lowStockQuery.isPending}
        isError={lowStockQuery.isError}
        onRetry={() => void lowStockQuery.refetch()}
      />

      <RecentSales sales={recentSalesQuery.data ?? []} />

      <OutstandingCreditList invoices={outstandingCreditQuery.data ?? []} totalOutstanding={data.summary.outstanding_credit} />
    </div>
  );
}
