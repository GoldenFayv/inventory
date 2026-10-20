import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, CreditCard, Gift, LoaderCircle } from "lucide-react";
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="animate-spin" />
        <span className="ml-2">Loading subscription plans...</span>
      </div>
    );
  }

  if (isError || !plans) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <p className="text-danger">Couldn't load subscription plans.</p>
        <button
          onClick={() => void refetch()}
          className="mt-4 rounded-input bg-primary px-4 py-2 text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <header className="text-center">
        <p className="text-sm font-medium text-primary">GET STARTED</p>
        <h1 className="mt-2 text-2xl font-bold text-text sm:text-3xl">
          Choose how you want to get started
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-text-muted">
          Try Inventory free for 14 days, or choose a plan that suits your
          business.
        </p>
      </header>

      {message && (
        <div
          role="status"
          className="rounded-input border border-border bg-surface p-3 text-sm text-text"
        >
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="flex flex-col rounded-card border border-border bg-surface p-6">
          <div className="flex items-center gap-2 text-primary">
            <Gift size={20} />
            <h2 className="text-lg font-semibold text-text">Free trial</h2>
          </div>

          <p className="mt-3 text-3xl font-bold text-text">₦0</p>
          <p className="mt-1 text-sm text-text-muted">14 days</p>
          <p className="mt-4 flex-1 text-sm text-text-muted">
            Explore the app before deciding which paid plan works for your
            store.
          </p>

          <button
            onClick={() => void activateTrial()}
            disabled={trialLoading}
            className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-input bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {trialLoading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Gift size={18} />
            )}
            {trialLoading ? "Activating..." : "Start free trial"}
          </button>
        </section>

        {plans.map((plan) => {
          const selectedPrice =
            plan.prices.find(
              (price) => price.billing_interval === selectedIntervals[plan.id],
            ) ?? plan.prices[0];

          return (
            <section
              key={plan.id}
              className="flex flex-col rounded-card border border-border bg-surface p-6"
            >
              <h2 className="text-lg font-semibold text-text">{plan.name}</h2>
              <p className="mt-2 text-sm text-text-muted">{plan.description}</p>

              {plan.prices.length > 1 && (
                <label className="mt-4 block">
                  <span className="mb-1 block text-sm text-text-muted">
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
                    className="w-full rounded-input border border-border bg-background p-2 text-text"
                  >
                    {plan.prices.map((price) => (
                      <option key={price.id} value={price.billing_interval}>
                        {price.billing_interval}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <p className="mt-5 text-3xl font-bold text-text">
                ₦{(selectedPrice?.price ?? 0).toLocaleString("en-NG")}
                <span className="text-sm font-normal text-text-muted">
                  {" "}
                  / {selectedPrice?.billing_interval ?? "period"}
                </span>
              </p>

              <div className="mt-5 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center gap-2 text-sm text-text-muted"
                  >
                    <Check size={16} className="shrink-0 text-success" />
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
                className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-input border border-primary px-4 py-2 font-medium text-primary hover:bg-primary-light disabled:opacity-60"
              >
                {subscribingPriceId === selectedPrice?.id ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <CreditCard size={18} />
                )}
                {subscribingPriceId === selectedPrice?.id
                  ? "Opening checkout..."
                  : "Subscribe"}
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}
