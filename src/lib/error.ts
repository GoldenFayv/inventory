import { isAxiosError } from "axios";

export type FieldErrors = Record<string, string[]>;

export function getValidationErrors(
    error: unknown,
    fallback = "Something went wrong. Please try again.",
): { message: string; fields: FieldErrors } {
    if (isAxiosError(error)) {
        const data = error.response?.data;
        return {
            message: data?.message ?? fallback,
            fields: (data?.errors ?? {}) as FieldErrors,
        };
    }
    return { message: fallback, fields: {} };
}