export interface DashboardSummary {
  sales: number;
  money_received: number;
  outstanding_credit: number;
  stock_value: number;
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  // low_stock_products: IProduct[];
  // recent_sales: RecentSale[];
  // outstanding_credit_invoices: IInvoice[];
}