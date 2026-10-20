declare module "@paystack/inline-js" {
    interface PaystackCallbacks {
        onSuccess?: () => void;
        onCancel?: () => void;
        onError?: () => void;
    }

    class Paystack {
        resumeTransaction(
            accessCode: string,
            callbacks?: PaystackCallbacks,
        ): void;
    }

    export default Paystack;
}