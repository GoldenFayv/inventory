import { useState } from "react";
import type { SubmitEvent } from "react";
import type { PaymentMethod } from "../types/sale.types";

interface PayInvoiceFormProps {
  balance: number;
  isPending: boolean;
  onSubmit: (amount: number, method: PaymentMethod) => void;
}

const money = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);

export default function PayInvoiceForm({
  balance,
  isPending,
  onSubmit,
}: PayInvoiceFormProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const numericAmount = Number(amount);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > balance
    ) {
      return;
    }

    onSubmit(numericAmount, method);
  }

  if (balance <= 0) {
    return (
      <p className="text-sm text-green-700">
        This invoice has been fully paid.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-text-muted">Outstanding balance</p>
        <p className="text-xl font-semibold text-text">{money(balance)}</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="payment-amount" className="text-sm font-medium">
          Amount to pay
        </label>
        <input
          id="payment-amount"
          type="number"
          min="0.01"
          max={balance}
          step="0.01"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-input border border-border bg-background px-3 py-2 text-text"
          placeholder="Enter amount"
        />
        <p className="text-xs text-text-muted">
          You can pay part or all of the balance.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="payment-method" className="text-sm font-medium">
          Payment method
        </label>
        <select
          id="payment-method"
          value={method}
          onChange={(event) => setMethod(event.target.value as PaymentMethod)}
          className="w-full rounded-input border border-border bg-background px-3 py-2 text-text"
        >
          <option value="cash">Cash</option>
          <option value="transfer">Bank transfer</option>
        </select>
      </div>

      {numericAmount > balance && (
        <p className="text-sm text-red-600">
          Amount cannot exceed the outstanding balance.
        </p>
      )}

      <button
        type="submit"
        disabled={
          isPending ||
          !amount ||
          !Number.isFinite(numericAmount) ||
          numericAmount <= 0 ||
          numericAmount > balance
        }
        className="w-full rounded-input bg-primary px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Recording payment..." : "Record payment"}
      </button>
    </form>
  );
}
