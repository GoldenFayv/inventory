
import {
  Banknote,
  Wallet,
  Users,
  PackageX
} from 'lucide-react';
import { getDashboardSummary } from './dashboard.service';
import type { DashboardResponse } from './dashboard.types';
import { mockDashboardData } from './dashboard.mock';

export const dashboardSummary = [
  {
    label: "Sales today",
    amount: 84500,
    description: 'Total value of sales',
    icon: Banknote,
    color: 'primary',
  },
  {
    label: 'Money received',
    amount: 62000,
    description: 'Cash and transfers',
    icon: Wallet,
    color: 'success',
  },
  {
    label: 'Customers owe',
    amount: 128000,
    description: 'Outstanding credit',
    icon: Users,
    color: 'warning',
  },
  {
    label: 'Low stock items',
    amount: 3,
    description: 'Products to restock',
    icon: PackageX,
    color: 'danger',
  },
] as const;

export const lowStockProducts = [
  { id: 1, name: 'Golden Morn 500g', quantity: 4 },
  { id: 2, name: 'Peak Milk 400g', quantity: 2 },
  { id: 3, name: 'Sugar 1kg', quantity: 3 },
];
const USE_MOCK_DASHBOARD = true;
export async function getDashboardData(): Promise<DashboardResponse> {
  if (USE_MOCK_DASHBOARD) {
    return mockDashboardData;
  }

  return getDashboardSummary();
}