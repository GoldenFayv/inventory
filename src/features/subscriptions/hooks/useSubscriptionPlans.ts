import { useMutation, useQuery } from "@tanstack/react-query";
import { subscriptionService } from "../services/subscription.service";

export function useSubscriptionPlans() {
    return useQuery({
        queryKey: ["subscription-plans"],
        queryFn: subscriptionService.getPlans,
        staleTime: 5 * 60 * 1000,
    });
}

export function useActivateTrial() {
    return useMutation({
        mutationFn: subscriptionService.activateTrial,
    });
}

export function useSubscribe() {
    return useMutation({
        mutationFn: subscriptionService.subscribe,
    });
}

export function useVerifyTransaction() {
    return useMutation({
        mutationFn: subscriptionService.verifyTransaction,
    });
}