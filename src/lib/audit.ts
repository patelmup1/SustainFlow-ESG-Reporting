import db from './db';
import { randomUUID } from 'crypto';

interface AuditLogParams {
    organizationId?: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: any;
}

export function logAction(params: AuditLogParams) {
    try {
        const stmt = db.prepare(`
      INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            randomUUID(),
            params.organizationId || null,
            params.userId || null,
            params.action,
            params.entityType,
            params.entityId || null,
            params.details ? JSON.stringify(params.details) : null
        );
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Audit failure should not break the app flow typically, but critical in some compliance apps.
        // For now we log and continue.
    }
}
