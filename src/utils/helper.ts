const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Digits with an optional leading +, 7-15 digits (E.164 length range).
// Spaces, dashes and parentheses are stripped before testing.
const PHONE_REGEX = /^\+?\d{7,15}$/;

export function validateIdentifier(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) return "Enter your email or phone number.";

    if (trimmed.includes("@")) {
        return EMAIL_REGEX.test(trimmed) ? null : "Enter a valid email address.";
    }

    const normalized = trimmed.replace(/[\s\-()]/g, "");
    return PHONE_REGEX.test(normalized)
        ? null
        : "Enter a valid email address or phone number.";
}

export function validatePassword(value: string): string | null {
    if (!value) return "Enter your password.";

    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/\p{Lu}/u.test(value) || !/\p{Ll}/u.test(value)) {
        return "Password must contain both uppercase and lowercase letters.";
    }
    if (!/\p{N}/u.test(value)) return "Password must contain at least one number.";
    if (!/[\p{Z}\p{S}\p{P}]/u.test(value)) {
        return "Password must contain at least one symbol.";
    }

    return null;
}

// Normalize before sending so the backend gets a consistent value.
export function normalizeIdentifier(value: string): string {
    const trimmed = value.trim();
    return trimmed.includes("@")
        ? trimmed.toLowerCase()
        : trimmed.replace(/[\s\-()]/g, "");
}