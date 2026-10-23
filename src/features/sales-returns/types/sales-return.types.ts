import type { ICustomer } from "../../sales/types/sale.types";

export type SalesReturnStatus = "pending" | "approved" | "rejected";
export type ReturnItemCondition = "saleable" | "damaged";

export interface ReturnUserSummary {
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
}

export interface ReturnProductSummary {
  id?: string;
  name?: string;
  sku?: string | null;
}

export interface SalesReturnItem {
  id: string;
  invoice_item_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  condition: ReturnItemCondition;
  restock_quantity: number;
  damaged_quantity: number;
  reason?: string | null;
  product?: ReturnProductSummary | null;
  invoice_item?: {
    id: string;
    quantity: number;
    unit_price: number;
    product?: ReturnProductSummary | null;
  } | null;
}

export interface SalesReturnInvoiceSummary {
  id: string;
  reference?: string;
  total_amount?: number;
  total_amount_paid?: number;
  customer: ICustomer
  generated_at?: string;
  items?: InvoiceItem[];
}

export interface SalesReturn {
  id: string;
  store_id: string;
  invoice_id: string;
  reference: string;
  status: SalesReturnStatus;
  reason: string;
  total_amount: number;
  debt_reduction_amount: number;
  customer_credit_amount: number;
  requested_by?: string;
  approved_by?: string | null;
  approval_note?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at?: string;
  invoice?: SalesReturnInvoiceSummary | null;
  requester?: ReturnUserSummary | null;
  approver?: ReturnUserSummary | null;
  items: SalesReturnItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
  product?: ReturnProductSummary | null;
}

export interface InvoiceForReturn {
  id: string;
  reference?: string;
  total_amount?: number;
  total_amount_paid?: number;
  customer: ICustomer
  generated_at?: string;
  items: InvoiceItem[];
}

export interface CreateSalesReturnItemPayload {
  invoice_item_id: string;
  quantity: number;
  condition: ReturnItemCondition;
  reason?: string;
}

export interface CreateSalesReturnPayload {
  reason: string;
  items: CreateSalesReturnItemPayload[];
}

export interface ReviewSalesReturnPayload {
  action: "approved" | "rejected";
  note?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
