export type Role = 'GLOBAL_ADMIN' | 'ADMIN' | 'CONTRIBUTOR' | 'VIEWER';
export type SubscriptionPlan = 'FREE' | 'STANDARD' | 'PRO' | 'ENTERPRISE';
export type MetricFrequency = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type MetricCategory = 'Environmental' | 'Social' | 'Governance';
export type EntryStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Organization {
    id: string;
    name: string;
    industry?: string;
    subscription_plan: SubscriptionPlan;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    organization_id: string;
    email: string;
    name: string;
    role: Role;
    created_at: string;
    updated_at: string;
}

export interface MetricDefinition {
    id: string;
    organization_id?: string; // null for system metrics
    name: string;
    code: string;
    unit: string;
    category: MetricCategory;
    frequency: MetricFrequency;
    is_custom: boolean;
    description?: string;
    framework_tags?: string[]; // parsed from JSON
    created_at: string;
}

export interface MetricValue {
    id: string;
    organization_id: string;
    metric_id: string;
    user_id: string;
    value: string; // stored as string, cast to number
    period_start: string; // ISO Date YYYY-MM-DD
    period_end: string;
    calculated_emission: number;
    status: EntryStatus;
    comments?: Comment[]; // parsed from JSON
    created_at: string;
    updated_at: string;
}

export interface Comment {
    user_id: string;
    user_name: string;
    text: string;
    timestamp: string;
}

export interface EmissionFactor {
    id: string;
    name: string;
    source?: string;
    unit: string;
    factor_value: number;
}

export interface Target {
    id: string;
    organization_id: string;
    metric_id?: string;
    category?: string;
    name: string;
    target_value: number;
    baseline_year: number;
    target_year: number;
    created_at: string;
}

export interface Report {
    id: string;
    organization_id: string;
    name: string;
    type: string;
    period_start: string;
    period_end: string;
    data_snapshot?: string;
    file_url?: string;
    created_by: string;
    created_at: string;
}

export interface AuditLog {
    id: string;
    organization_id?: string;
    user_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: any;
    timestamp: string;
    user_name?: string; // Joined field
}
