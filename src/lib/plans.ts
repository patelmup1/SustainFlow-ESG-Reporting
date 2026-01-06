export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export const PLANS: Record<PlanType, {
    label: string;
    features: string[];
    limits: {
        users: number;
        metrics: number;
    };
    stripePriceId?: string;
}> = {
    FREE: {
        label: 'Free Trial',
        features: ['BASIC_REPORTS'],
        limits: { users: 1, metrics: 5 }
    },
    STARTER: {
        label: 'Starter',
        features: ['BASIC_REPORTS', 'EMAIL_SUPPORT'],
        limits: { users: 3, metrics: 10 },
        stripePriceId: 'price_1ScTWg7oH1LxNyCvyaJ1rj4S'
    },
    PRO: {
        label: 'Pro',
        features: ['BASIC_REPORTS', 'GRI_REPORTS', 'AI_INSIGHTS', 'CSV_IMPORT', 'AUDIT_LOGS'],
        limits: { users: 10, metrics: 50 },
        stripePriceId: 'price_1ScTYY7oH1LxNyCvOyThpbfI'
    },
    ENTERPRISE: {
        label: 'Enterprise',
        features: ['BASIC_REPORTS', 'GRI_REPORTS', 'AI_INSIGHTS', 'CSV_IMPORT', 'AUDIT_LOGS', 'SSO', 'API_ACCESS'],
        limits: { users: 999, metrics: 999 },
        stripePriceId: '' // Custom pricing
    }
};

export function hasFeature(plan: string, feature: string): boolean {
    const p = PLANS[plan as PlanType] || PLANS['FREE'];
    return p.features.includes(feature);
}

export function checkLimit(plan: string, resource: 'users' | 'metrics', currentCount: number): boolean {
    const p = PLANS[plan as PlanType] || PLANS['FREE'];
    return currentCount < p.limits[resource];
}
