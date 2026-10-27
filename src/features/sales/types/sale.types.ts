import type IUser from "../../../types/user.types";

export type PaymentMethod = "cash" | "transfer";

export interface SaleItemPayload {
    product_id: Id;
    quantity: number;
    unit_price?: number;
}

export interface CreateSalePayload {
    items: SaleItemPayload[];
    customer_name: string;
    customer_phone: string;
    amount_paid?: number;
    payment_method?: PaymentMethod;
    due_date?: string;
    customer_email?: string;
    customer_address?: string;
    customer_lga_id?: string;
}

export interface ICustomer {
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
}

export interface IInvoiceItem {
    id: Id;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: IInvoiceProduct;
}

export interface IPayment {
    id: Id;
    reference: string;
    amount: number;
    method: PaymentMethod;
}

export interface IInvoice {
    id: Id;
    total_amount: number;
    reference: string;
    total_amount_paid: number;
    generated_at: string;
    generated_by: IUser;
    customer: ICustomer;
    items: IInvoiceItem[];
    payments: IPayment[];
    store: IInvoiceStore
}

export interface IInvoiceProduct {
    id: Id;
    name: string;
    sku: string;
    selling_price: number;
    cost_price: number;
    low_stock_threshold: number | null;
    quantity: number;
    is_active: boolean;
}
export interface IInvoiceStore {
    id: Id;
    name: string;
    address: string | null;
    phone?: string | null;
    email?: string | null;
    zip_code?: string | null;
}


export interface UpdateSalePayload {
    amount?: number;
    payment_method?: PaymentMethod;
    items?: SaleItemPayload[];
}
