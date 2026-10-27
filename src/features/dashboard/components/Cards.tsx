import {
  ShoppingBag,
  Wallet,
  HandCoins,
  PackageSearch,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { DashboardResponse } from "../dashboard.types";
import SummaryCard from "./SummaryCard";
import { HasPermission } from "../../../components/layout/HasPermission";
import { PermissionEnum } from "../../../utils/permissions";
import { useState } from "react";

type CardsProps = {
  data: DashboardResponse;
  dateMode: string;
  periodLabel: string;
};

type SummaryCardProps = {
  label: string;
  amount: number;
  description: string;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "danger";
  isCurrency?: boolean;
  permission: string;
};

export default function DashboardCards({
  data,
  dateMode,
  periodLabel,
}: CardsProps) {
  const something: SummaryCardProps[] = [
    {
      label: dateMode === "today" ? "Sales today" : "Sales",
      amount: data.summary.sales,
      description: `Total value of sales ${periodLabel}`,
      color: "primary",
      isCurrency: true,
      icon: ShoppingBag,
      permission: PermissionEnum.SALES_VIEW,
    },
    {
      label: "Money received",
      amount: data.summary.money_received,
      description: `Payments received ${periodLabel}`,
      color: "success",
      isCurrency: true,
      icon: Wallet,
      permission: PermissionEnum.SALES_VIEW,
    },
    {
      label: "Customers owe",
      amount: data.summary.outstanding_credit,
      description: "Outstanding credit balance",
      color: "warning",
      isCurrency: true,
      icon: HandCoins,
      permission: PermissionEnum.SALES_VIEW,
    },
    {
      label: "Low stock items",
      amount: data.summary.low_stock_count,
      description: "Products to restock",
      color: "danger",
      isCurrency: false,
      icon: PackageSearch,
      permission: PermissionEnum.PRODUCTS_VIEW,
    },
    {
      label: "Stock value",
      amount: data.summary.stock_value,
      description: "Estimated inventory cost",
      color: "success",
      isCurrency: true,
      icon: Warehouse,
      permission: PermissionEnum.PRODUCTS_VIEW || PermissionEnum.SALES_VIEW,
    },
  ] as const;

  const [cards] = useState<SummaryCardProps[]>(something);

  return (
    <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {data &&
        cards.map((card: SummaryCardProps) =>
          card.permission ? (
            <HasPermission key={card.label} to={card.permission}>
              <SummaryCard {...card} />
            </HasPermission>
          ) : (
            <SummaryCard key={card.label} {...card} />
          ),
        )}
    </div>
  );
}
