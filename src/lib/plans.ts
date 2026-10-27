import "server-only";

import type { ApiResponse, SubscriptionPlan, } from "@/types/plan";

export async function getPlans(): Promise<SubscriptionPlan[]> {
    const apiUrl = process.env.TALLYHOUSE_API_URL;

    if (!apiUrl) {
        throw new Error("TALLYHOUSE_API_URL is not configured.");
    }

    const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/api/v1/plans`,
        {
            next: {
                revalidate: 3600,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch subscription plans: ${response.status}`,
        );
    }

    const result: ApiResponse<SubscriptionPlan[]> = await response.json();

    return result.data;
}