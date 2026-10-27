import { useState, type ComponentProps, type ReactNode } from "react";

import QuickActions from "./components/QuickActions";
import LowStockList from "./components/LowStockList";
import { useDashboard } from "./useDashboard";
import InventoryHealth from "./components/InventoryHealth";
import { useLowStockProducts } from "../products/useProduct";
import { useOutstandingCredit, useRecentSales } from "../sales/useSales";
import RecentSales from "./components/RecentSales";
import OutstandingCreditList from "./OutstandingCreditList";
import DashboardCards from "./components/Cards";
import { HasPermission } from "../../components/layout/HasPermission";
import { PermissionEnum } from "../../utils/permissions";
import SectionError from "./components/SectionError";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import RefreshButton from "../../components/ui/RefreshButton";
import type { DashboardResponse } from "./dashboard.types";

type DateMode = "today" | "single" | "range";

const MIN_DATE = "2000-01-01";

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

/**
 * A complete YYYY-MM-DD date between MIN_DATE and today.
 * ISO date strings compare correctly as plain text.
 */
function isUsableDate(value: string, today: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= MIN_DATE && value <= today
  );
}

/**
 * Turns the raw input values into a period that is always valid:
 * - an empty or half-typed "from" falls back to today
 * - an empty "to" means "through today"
 * - "to" can never be earlier than "from"
 * The mode is derived, so the labels, the API filters and the cards
 * can never disagree with what the inputs show.
 */
function resolvePeriod(from: string, to: string, today: string) {
  const start = isUsableDate(from, today) ? from : today;
  const requestedEnd = isUsableDate(to, today) ? to : today;
  const end = requestedEnd < start ? start : requestedEnd;

  const mode: DateMode =
    start === end ? (start === today ? "today" : "single") : "range";

  return { start, end, mode };
}

function SectionSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-32 animate-pulse rounded-card border border-border bg-surface"
    />
  );
}

/*
 * Each section below owns its query. It only runs when the section is
 * mounted (i.e. the user passed <HasPermission>), and if it fails, only
 * that section shows an error. Nothing else on the page is affected.
 */

function LowStockSection() {
  const query = useLowStockProducts();

  return (
    <LowStockList
      products={query.data ?? []}
      isLoading={query.isPending}
      isError={query.isError}
      onRetry={() => void query.refetch()}
    />
  );
}

function RecentSalesSection() {
  const query = useRecentSales();

  if (query.isPending) return <SectionSkeleton />;

  if (query.isError) {
    return (
      <SectionError
        title="Recent sales"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return <RecentSales sales={query.data ?? []} />;
}

function OutstandingCreditSection({
  totalOutstanding,
}: {
  totalOutstanding: ComponentProps<
    typeof OutstandingCreditList
  >["totalOutstanding"];
}) {
  const query = useOutstandingCredit();

  if (query.isPending) return <SectionSkeleton />;

  if (query.isError) {
    return (
      <SectionError
        title="Outstanding credit"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <OutstandingCreditList
      invoices={query.data ?? []}
      totalOutstanding={totalOutstanding}
    />
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const isRefreshing = useIsFetching() > 0;
  const [from, setFrom] = useState(getLocalDate);
  const [to, setTo] = useState("");

  const today = getLocalDate();
  const { start, end, mode: dateMode } = resolvePeriod(from, to, today);

  // The "to" field only matters once "from" is earlier than today
  const showTo = from !== "" && from < today;

  // 1. Filters sent to the API
  const filters =
    dateMode === "range"
      ? { from: start, to: end }
      : dateMode === "single"
        ? { date: start }
        : {};

  const summaryQuery = useDashboard(filters);
  const summary = summaryQuery.data?.summary;

  // 2. Period label
  const periodLabels: Record<DateMode, string> = {
    today: "today",
    single: `on ${formatDate(start)}`,
    range: `from ${formatDate(start)} to ${formatDate(end)}`,
  };
  const periodLabel = periodLabels[dateMode];

  // 3. Heading date
  const todayFormatted = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const headingDates: Record<DateMode, string> = {
    today: todayFormatted,
    single: formatDate(start),
    range: `${formatDate(start)} – ${formatDate(end)}`,
  };
  const headingDate = headingDates[dateMode];

  function handleFromChange(value: string) {
    setFrom(value);

    // Cleared, today, or later than the current "to": reset "to" so the
    // period collapses to "from through today" instead of going invalid.
    if (!value || value >= today || (to && value > to)) {
      setTo("");
    }
  }

  /** Sections that need the summary request: loading, error or content. */
  function withSummary(
    title: string,
    // Replace 'DashboardSummary' with your actual interface/type name
    render: (summary: NonNullable<DashboardResponse["summary"]>) => ReactNode,
  ) {
    if (summary) return render(summary);
    if (summaryQuery.isPending) return <SectionSkeleton />;

    return (
      <SectionError
        title={title}
        error={summaryQuery.error}
        onRetry={() => void summaryQuery.refetch()}
      />
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
        <RefreshButton
          onRefresh={() => queryClient.refetchQueries({ type: "active" })}
          isRefreshing={isRefreshing}
          loadingLabel="Refreshing..."
        />
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

        <div
          className={`grid grid-cols-1 gap-3 ${showTo ? "sm:grid-cols-2" : ""}`}
        >
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
              min={MIN_DATE}
              max={today}
              onChange={(event) => handleFromChange(event.target.value)}
              className="min-h-12 w-full rounded-input border border-border bg-background px-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {showTo && (
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
                max={today}
                aria-describedby="dashboard-to-hint"
                onChange={(event) => setTo(event.target.value)}
                className="min-h-12 w-full rounded-input border border-border bg-background px-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              <p id="dashboard-to-hint" className="text-xs text-text-muted">
                Leave empty to include today.
              </p>
            </div>
          )}
        </div>

        {summaryQuery.isFetching && (
          <p role="status" className="text-sm text-text-muted">
            Updating summary...
          </p>
        )}
      </section>

      <section aria-label="Shop summary">
        {summaryQuery.isPending ? (
          <div
            aria-busy="true"
            className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 xl:grid-cols-4"
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-card border border-border bg-surface"
              />
            ))}
          </div>
        ) : summaryQuery.data ? (
          <DashboardCards
            data={summaryQuery.data}
            periodLabel={periodLabel}
            dateMode={dateMode}
          />
        ) : (
          <SectionError
            title="Couldn't load your shop summary"
            error={summaryQuery.error}
            onRetry={() => void summaryQuery.refetch()}
          />
        )}
      </section>

      <QuickActions />

      <HasPermission to={PermissionEnum.PRODUCTS_VIEW}>
        {withSummary("Inventory summary", (s) => (
          <InventoryHealth
            totalProducts={s.total_products}
            lowStockCount={s.low_stock_count}
            outOfStockCount={s.out_of_stock_count}
          />
        ))}
      </HasPermission>

      <HasPermission to={PermissionEnum.PRODUCTS_VIEW}>
        <LowStockSection />
      </HasPermission>

      {/* NOTE: was PRODUCTS_VIEW. Swap in your real sales/credit permission. */}
      <HasPermission to={PermissionEnum.SALES_VIEW}>
        <RecentSalesSection />
      </HasPermission>

      <HasPermission to={PermissionEnum.SALES_VIEW}>
        {withSummary("Outstanding credit", (s) => (
          <OutstandingCreditSection totalOutstanding={s.outstanding_credit} />
        ))}
      </HasPermission>
    </div>
  );
}
