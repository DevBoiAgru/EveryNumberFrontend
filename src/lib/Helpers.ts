export function abbrvNumber(num: number) {
    // Helper function to abbreviate numbers into strings like 10252 -> 10.2K
    if (num < 10_000) {
        // Don't touch smaller numbers, just add commas
        return String(num);
    }
    if (num < 1_000_000) {
        return `${(num / 1_000).toFixed(2)}K`;
    }
    if (num < 1_000_000_000) {
        return `${(num / 1_000_000).toFixed(2)}M`;
    } else {
        return `${(num / 1_000_000_000).toFixed(2)}B`;
    }
}

export function clamp(num: number, low: number, high: number) {
    return Math.min(Math.max(num, low), high)
}