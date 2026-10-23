import type { SalesReturnStatus } from "../types/sales-return.types";

const statusStyles: Record<SalesReturnStatus, string> = {
  pending: "border-warning/30 bg-warning/10 text-warning",
  approved: "border-success/30 bg-success/10 text-success",
  rejected: "border-danger/30 bg-danger/10 text-danger",
};

const statusLabels: Record<SalesReturnStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function ReturnStatusBadge({
  status,
}: {
  status: SalesReturnStatus;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
