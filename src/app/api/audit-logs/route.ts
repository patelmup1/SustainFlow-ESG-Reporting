import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session || !session.organization_id || session.role !== 'ADMIN') {
        // Only Admins see audit logs
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const logs = db.prepare(`
            SELECT a.*, u.name as user_name 
            FROM audit_logs a 
            LEFT JOIN users u ON a.user_id = u.id 
            WHERE a.organization_id = ? 
            ORDER BY a.timestamp DESC
            LIMIT 100
        `).all(session.organization_id);

        return NextResponse.json({ logs });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
