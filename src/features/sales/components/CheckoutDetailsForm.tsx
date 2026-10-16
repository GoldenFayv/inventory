import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { IState } from "../../../types/lga.types";
import type { PaymentMethod } from "../types/sale.types";
import { generalService } from "../../../services/misc-services";

export interface ICheckoutDetails {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  customer_lga_id: string;
  amount_paid: string;
  payment_method: PaymentMethod;
  due_date: string;
}

interface CheckoutDetailsFormProps {
  totalAmount: number;
  onSubmit: (details: ICheckoutDetails) => void;
  isSubmitting: boolean;
  isCartEmpty: boolean;
}

const initialDetails: ICheckoutDetails = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  customer_address: "",
  customer_lga_id: "",
  amount_paid: "0",
  payment_method: "cash",
  due_date: "",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CheckoutDetailsForm({
  totalAmount,
  onSubmit,
  isSubmitting,
  isCartEmpty,
}: CheckoutDetailsFormProps) {
  const [details, setDetails] = useState(initialDetails);
  const [selectedStateId, setSelectedStateId] = useState("");

  const {
    data: states = [],
    isPending: isLoadingStates,
    isError: isStatesError,
  } = useQuery<IState[]>({
    queryKey: ["states"],
    queryFn: () => generalService.getStates(),
    staleTime: 5 * 60 * 1000,
  });

  const selectedState = useMemo(
    () => states.find((state) => state.id === selectedStateId),
    [states, selectedStateId],
  );

  const lgas = selectedState?.lga ?? [];

  const amountPaid = Number(details.amount_paid || 0);
  const balance = Math.max(0, totalAmount - amountPaid);

  function updateField<K extends keyof ICheckoutDetails>(
    field: K,
    value: ICheckoutDetails[K],
  ) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (totalAmount <= 0) return;

    onSubmit({
      ...details,
      customer_name: details.customer_name.trim(),
      customer_phone: details.customer_phone.trim(),
      customer_email: details.customer_email.trim(),
      customer_address: details.customer_address.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-card border border-border bg-surface p-4 sm:p-5"
    >
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Customer details</h2>
          <p className="mt-1 text-sm text-text-muted">
            Name and phone number are required.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-text">
              Customer name *
            </span>
            <input
              required
              maxLength={255}
              value={details.customer_name}
              onChange={(event) =>
                updateField("customer_name", event.target.value)
              }
              placeholder="Enter customer name"
              className="w-full rounded-input border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-text">
              Phone number *
            </span>
            <input
              required
              type="tel"
              maxLength={30}
              value={details.customer_phone}
              onChange={(event) =>
                updateField("customer_phone", event.target.value)
              }
              placeholder="Enter phone number"
              className="w-full rounded-input border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-text">Email</span>
            <input
              type="email"
              value={details.customer_email}
              onChange={(event) =>
                updateField("customer_email", event.target.value)
              }
              placeholder="customer@example.com"
              className="w-full rounded-input border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-text">Address</span>
            <input
              value={details.customer_address}
              onChange={(event) =>
                updateField("customer_address", event.target.value)
              }
              placeholder="Customer address"
              className="w-full rounded-input border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-text">
              State (optional)
            </span>
            <select
              value={selectedStateId}
              onChange={(event) => {
                setSelectedStateId(event.target.value);
                updateField("customer_lga_id", "");
              }}
              disabled={isLoadingStates}
              className="w-full rounded-input border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">
                {isLoadingStates ? "Loading states..." : "Select a state"}
              </option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>

            {isStatesError && (
              <span className="text-xs text-danger">
                Couldn't load states. You can continue without an LGA.
              </span>
            )}
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-text">
              Local government area (optional)
            </span>
            <select
              value={details.customer_lga_id}
              onChange={(event) =>
                updateField("customer_lga_id", event.target.value)
              }
              disabled={!selectedStateId || lgas.length === 0}
              className="w-full rounded-input border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">Select an LGA</option>
              {lgas.map((lga) => (
                <option key={lga.id} value={lga.id}>
                  {lga.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <div className="border-t border-border" />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Payment</h2>
          <p className="mt-1 text-sm text-text-muted">
            Total due: {formatCurrency(totalAmount)}
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text">Amount paid (₦)</span>
          <input
            type="number"
            required
            min="0"
            // max={totalAmount}
            step="0.01"
            value={details.amount_paid}
            onChange={(event) => updateField("amount_paid", event.target.value)}
            placeholder="0"
            className="w-full rounded-input border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary"
          />
        </label>

        {amountPaid > 0 && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-text">
              Payment method
            </span>
            <select
              required
              value={details.payment_method}
              onChange={(event) =>
                updateField(
                  "payment_method",
                  event.target.value as PaymentMethod,
                )
              }
              className="w-full rounded-input border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary"
            >
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>
        )}

        {balance > 0 && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-text">
              Payment due date (optional)
            </span>
            <input
              type="date"
              value={details.due_date}
              onChange={(event) => updateField("due_date", event.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-input border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary"
            />
          </label>
        )}

        <div className="rounded-input bg-background p-3">
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-text-muted">Amount paid</span>
            <span className="font-medium text-text">
              {formatCurrency(amountPaid)}
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-3 text-sm">
            <span className="text-text-muted">Outstanding balance</span>
            <span className="font-semibold text-text">
              {formatCurrency(balance)}
            </span>
          </div>

          <p className="mt-2 text-xs text-text-muted">
            Payment status:{" "}
            {amountPaid <= 0
              ? "Unpaid"
              : amountPaid >= totalAmount
                ? "Paid"
                : "Partial"}
          </p>

          {amountPaid > totalAmount && (
            <p className="mt-2 text-xs text-warning">
              Amount paid is {formatCurrency(amountPaid - totalAmount)} more
              than the total.
            </p>
          )}
        </div>
      </section>
      <button
        type="submit"
        disabled={isSubmitting || isCartEmpty /*|| amountPaid > totalAmount*/}
        className="w-full rounded-input bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Processing sale..." : "Complete sale"}
      </button>
    </form>
  );
}
