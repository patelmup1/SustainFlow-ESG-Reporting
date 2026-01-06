type RateLimitStore = {
    [key: string]: {
        count: number;
        lastAttempt: number;
    };
};

const store: RateLimitStore = {};

export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = store[ip];

    if (!record) {
        store[ip] = { count: 1, lastAttempt: now };
        return false; // Not limited
    }

    if (now - record.lastAttempt > windowMs) {
        // Window expired, reset
        store[ip] = { count: 1, lastAttempt: now };
        return false;
    }

    // Within window
    record.count++;
    record.lastAttempt = now;

    return record.count > limit;
}
