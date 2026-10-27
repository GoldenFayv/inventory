export type BillingInterval = "monthly" | "yearly" | "bi-weekly";

export interface PlanPrice {
    id: string;
    billing_interval: BillingInterval;
    price: number;
}

export interface PlanFeature {
    id: string;
    feature: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    prices: PlanPrice[];
    features: PlanFeature[];
}

export interface ApiResponse<T> {
    data: T;
}