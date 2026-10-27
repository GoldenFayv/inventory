import Link from "next/link";
import { getPlans } from "@/lib/plans";
import type { BillingInterval, SubscriptionPlan } from "@/types/plan";

const APP_URL = "https://app.usetallyhouse.com/";

const featureLabels: Record<string, string> = {
  inventory: "Inventory tracking",
  sales: "Sales tracking",
  staff_management: "Staff management",
  store_management: "Store management",
  sales_returns: "Sales returns",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function PricingSection() {
  let plans;

  try {
    plans = await getPlans();
  } catch (e) {
    console.log("Error", e);
    return (
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-semibold">
            Simple pricing for your business
          </h2>
          <p className="mt-3 text-text-muted">
            We couldn&apos;t load our plans right now. Please try again shortly.
          </p>
        </div>
      </section>
    );
  }

  return <PricingContent plans={plans} />;
}

// function PricingContent({plans}: {plans: Awaited<ReturnType<typeof getPlans>>;}) {
function PricingContent({ plans }: { plans: SubscriptionPlan[] }) {
  const intervals: BillingInterval[] = ["monthly", "yearly"];

  return (
    <section id="pricing" className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
            Pricing
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Choose what works for your shop
          </h2>

          <p className="mt-4 text-text-secondary">
            Straightforward plans to help you manage your business records.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="flex flex-col rounded-card border border-border bg-background p-7 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <h3 className="text-xl font-semibold text-text-primary">
                {plan.name}
              </h3>

              <p className="mt-2 min-h-12 text-sm leading-6 text-text-secondary">
                {plan.description}
              </p>

              <div className="mt-6 space-y-3">
                {intervals.map((interval) => {
                  const price = plan.prices.find(
                    (item) => item.billing_interval === interval,
                  );

                  if (!price) return null;

                  return (
                    <div
                      key={price.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="text-sm text-text-secondary">
                        {interval === "monthly" ? "Monthly" : "Yearly"}
                      </span>

                      <span className="font-semibold text-text-primary">
                        {formatPrice(price.price)}
                        <span className="ml-1 text-sm font-normal text-text-muted">
                          /{interval === "monthly" ? "month" : "year"}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="my-6 border-t border-border" />

              <h4 className="text-sm font-semibold text-text-primary">
                Included features
              </h4>

              <ul className="mt-4 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature.id}
                    className="flex items-start gap-3 text-sm text-text-secondary"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 text-brand-primary"
                    >
                      ✓
                    </span>

                    {featureLabels[feature.feature] ??
                      feature.feature.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>

              <Link
                href={APP_URL}
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-input bg-primary px-5 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
              >
                Get started
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingFallback() {
  return (
    <section id="pricing" className="bg-surface px-6 py-20">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="mx-auto mb-12 max-w-md text-center">
          <div className="mx-auto h-4 w-20 rounded bg-gray-200" />
          <div className="mx-auto mt-4 h-8 w-72 max-w-full rounded bg-gray-200" />
          <div className="mx-auto mt-3 h-4 w-64 max-w-full rounded bg-gray-200" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-80 rounded-2xl border border-border bg-background p-7"
            >
              <div className="h-6 w-28 rounded bg-gray-200" />
              <div className="mt-4 h-4 w-full rounded bg-gray-200" />
              <div className="mt-8 h-8 w-36 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
