export type BillingInterval = "monthly" | "yearly";

export interface IPlanPrice {
    id: string;
    billing_interval: BillingInterval;
    price: number;
}

export interface IPlanFeature {
    id: string;
    feature: string;
}

export interface ISubscriptionPlan {
    id: string;
    name: string;
    description: string;
    prices: IPlanPrice[];
    features: IPlanFeature[];
}

export interface ISubscription {
    id: Id;
    billing_interval: string;
    price: number;
    starts_at: string;
    ends_at: string | null;
    cancelled_at: string | null;
    status: string;
    plan: ISubscriptionPlan;
}


export interface ISubscriptionTransaction {
    id: string;
    reference: string;
    amount: number;
    status: "successful" | "pending" | "failed";
}

export interface ISubscriptionCheckout extends ISubscriptionTransaction {
    checkout: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}