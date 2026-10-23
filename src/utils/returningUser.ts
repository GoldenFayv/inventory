const KEY = "tallyhouse:returning-user";

export function isReturningUser(): boolean {
    try {
        return localStorage.getItem(KEY) === "true";
    } catch {
        return false;
    }
}

export function markReturningUser(): void {
    try {
        localStorage.setItem(KEY, "true");
    } catch {
        // Storage unavailable; the user just sees the new-user copy next time.
    }
}