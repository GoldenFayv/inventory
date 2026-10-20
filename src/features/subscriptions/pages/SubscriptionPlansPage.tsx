import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CreditCard,
  Gift,
  Headset,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";
import { openSubscriptionCheckout } from "../services/paystack.service";
import { useAuth } from "../../../app/AuthProvider";

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { data: plans, isLoading, isError, refetch } = useSubscriptionPlans();

  const [selectedIntervals, setSelectedIntervals] = useState<
    Record<string, string>
  >({});
  const [trialLoading, setTrialLoading] = useState(false);
  const [subscribingPriceId, setSubscribingPriceId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState("");

  const activateTrial = async () => {
    setTrialLoading(true);
    setMessage("");

    try {
      const result = await (
        await import("../services/subscription.service")
      ).subscriptionService.activateTrial();

      if (result.status === "successful") {
        await refreshUser();
        navigate("/");
      } else {
        setMessage("We couldn't activate your free trial. Please try again.");
      }
    } catch {
      setMessage("We couldn't activate your free trial. Please try again.");
    } finally {
      setTrialLoading(false);
    }
  };

  const subscribe = async (priceId: string) => {
    setSubscribingPriceId(priceId);
    setMessage("");

    try {
      await openSubscriptionCheckout(priceId, {
        onVerified: async () => {
          setMessage("Payment verified successfully.");
          await refreshUser();
          navigate("/");
        },
        onPending: () => {
          setMessage(
            "Your payment is still being confirmed. Please check again shortly.",
          );
        },
        onError: (error) => setMessage(error),
      });
    } catch {
      setMessage("Unable to start checkout. Please try again.");
    } finally {
      setSubscribingPriceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <LoaderCircle size={24} className="animate-spin text-primary" />
        <span className="text-sm text-text-muted">
          Loading subscription plans...
        </span>
      </div>
    );
  }

  if (isError || !plans) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <p className="font-semibold text-text">
            Unable to load subscription plans
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => void refetch()}
            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold tracking-wide text-primary">
            <Sparkles size={15} />
            SIMPLE, TRANSPARENT PRICING
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl lg:text-5xl">
            The right tools for
            <span className="block text-primary">your growing business.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
            Take control of your inventory, track your sales, and manage
            customer debts — all in one place. Start free or choose a plan that
            fits your business.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-text-muted">
            <span className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              No payment for the trial
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              Plans for your business
            </span>
          </div>
        </header>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            aria-live="polite"
            className="mx-auto max-w-3xl rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text"
          >
            {message}
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {/* Free trial */}
          <section className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary/60" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Gift size={23} />
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                GET STARTED
              </span>
            </div>

            <h2 className="mt-6 text-xl font-bold text-text">O Maka Free trial? Biaaa!!</h2>

            <p className="mt-2 min-h-10 text-sm leading-6 text-text-muted">
              Discover how much easier running your store can be.
            </p>

            <div className="mt-6 border-b border-border pb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-text">
                  ₦0
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-primary">
                14 days to explore
              </p>
            </div>

            <div className="flex-1 space-y-4 py-6">
              <p className="text-sm font-semibold text-text">
                Included in your trial
              </p>

              {[
                "Explore inventory management",
                "Record sales and track debts",
                "Monitor your stock levels",
                "Experience the app before choosing a plan",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-5 text-text-muted"
                >
                  <Check size={17} className="mt-0.5 shrink-0 text-success" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => void activateTrial()}
              disabled={trialLoading}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {trialLoading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Gift size={18} />
              )}
              {trialLoading ? "Activating..." : "Start free trial"}
              {!trialLoading && <ArrowRight size={16} />}
            </button>
          </section>

          {/* Paid plans */}
          {plans.map((plan) => {
            const selectedPrice =
              plan.prices.find(
                (price) =>
                  price.billing_interval === selectedIntervals[plan.id],
              ) ?? plan.prices[0];

            const isSubscribing = subscribingPriceId === selectedPrice?.id;

            return (
              <section
                key={plan.id}
                className="relative flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-7"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CreditCard size={23} />
                </div>

                <h2 className="mt-6 text-xl font-bold text-text">
                  {plan.name}
                </h2>

                <p className="mt-2 min-h-10 text-sm leading-6 text-text-muted">
                  {plan.description}
                </p>

                <div className="mt-6 border-b border-border pb-6">
                  {plan.prices.length > 1 && (
                    <label className="mb-4 block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Billing interval
                      </span>

                      <select
                        value={selectedPrice?.billing_interval ?? ""}
                        onChange={(event) =>
                          setSelectedIntervals((current) => ({
                            ...current,
                            [plan.id]: event.target.value,
                          }))
                        }
                        className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {plan.prices.map((price) => (
                          <option key={price.id} value={price.billing_interval}>
                            {price.billing_interval
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (char) => char.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                      ₦{(selectedPrice?.price ?? 0).toLocaleString("en-NG")}
                    </span>
                    <span className="text-sm text-text-muted">
                      / {selectedPrice?.billing_interval ?? "period"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-text-muted">
                    Billed according to your selected interval.
                  </p>
                </div>

                <div className="flex-1 space-y-4 py-6">
                  <p className="text-sm font-semibold text-text">
                    What&apos;s included
                  </p>

                  {plan.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-start gap-3 text-sm leading-5 text-text-muted"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10">
                        <Check size={13} className="text-success" />
                      </span>

                      <span>
                        {feature.feature
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (selectedPrice) {
                      void subscribe(selectedPrice.id);
                    }
                  }}
                  disabled={!selectedPrice || subscribingPriceId !== null}
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubscribing ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <CreditCard size={18} />
                  )}

                  {isSubscribing ? "Opening checkout..." : "Choose this plan"}

                  {!isSubscribing && <ArrowRight size={16} />}
                </button>
              </section>
            );
          })}

          {/* Custom plan — always the final card */}
          <section className="relative flex flex-col overflow-hidden rounded-2xl border border-primary/25 bg-surface p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Headset size={23} />
            </div>

            <h2 className="mt-6 text-xl font-bold text-text">Custom plan</h2>

            <p className="mt-2 min-h-10 text-sm leading-6 text-text-muted">
              Need something tailored to your business? Let&apos;s work out a
              plan that fits.
            </p>

            <div className="mt-6 border-b border-border pb-6">
              <span className="text-3xl font-bold tracking-tight text-text">
                Let&apos;s talk
              </span>
              <p className="mt-2 text-sm text-text-muted">
                Pricing tailored to your needs
              </p>
            </div>

            <div className="flex-1 space-y-4 py-6">
              <p className="text-sm font-semibold text-text">
                Built around your business
              </p>

              {[
                "Discuss your business requirements",
                "Explore suitable features and limits",
                "Get a tailored pricing proposal",
                "Plan for your business as it grows",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-5 text-text-muted"
                >
                  <Check size={17} className="mt-0.5 shrink-0 text-success" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/contact-sales")}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Contact sales
              <ArrowRight size={16} />
            </button>

            <p className="mt-3 text-center text-xs text-text-muted">
              Let&apos;s find the right fit for your store.
            </p>
          </section>
        </div>

        {/* Footer reassurance */}
        <div className="mx-auto max-w-2xl border-t border-border pt-7 text-center">
          <p className="text-sm font-medium text-text">
            Have questions about choosing a plan?
          </p>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Choose a plan that suits your current needs, or contact our sales
            team to discuss a custom solution for your business.
          </p>
        </div>
      </div>
    </div>
  );
}
