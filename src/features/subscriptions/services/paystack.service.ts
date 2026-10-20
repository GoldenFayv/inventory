
import Paystack from "@paystack/inline-js";
import { subscriptionService } from "./subscription.service";

type CheckoutCallbacks = {
    onVerified: () => void;
    onPending: () => void;
    onError: (message: string) => void;
};

export async function openSubscriptionCheckout(priceId: string, callbacks: CheckoutCallbacks) {
    const checkout = await subscriptionService.subscribe(priceId);

    if (checkout.status === "successful") {
        callbacks.onVerified();
        return;
    }

    if (!checkout.checkout?.access_code) {
        throw new Error("Payment checkout could not be initialized.");
    }

    let verificationStarted = false;

    const verify = async () => {
        if (verificationStarted) return;
        verificationStarted = true;

        try {
            const result = await subscriptionService.verifyTransaction(checkout.reference);

            if (result.status === "successful") {
                callbacks.onVerified();
            } else {
                callbacks.onPending();
            }
        } catch {
            callbacks.onError("We couldn't confirm your payment. Please try checking again.",);
        }
    };

    const paystack = new Paystack();

    paystack.resumeTransaction(checkout.checkout.access_code, {
        onSuccess: () => {
            void verify();
        },
        onCancel: () => {
            void verify();
        },
        onError: () => {
            callbacks.onError("Paystack checkout couldn't be loaded. You can try again.");
        },
    });
}
