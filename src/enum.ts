export const SubscriptionStatus = {
    Active: "active",
    Trialing: "trialing",
    Canceled: "canceled",
    PastDue: "past_due"
}

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];