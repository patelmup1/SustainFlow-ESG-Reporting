import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Export all data related to this organization
        const orgId = session.organization_id;

        const users = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE organization_id = ?').all(orgId);
        const metrics = db.prepare('SELECT * FROM metrics WHERE organization_id = ? OR organization_id IS NULL').all(orgId);
        const entries = db.prepare('SELECT * FROM entries WHERE organization_id = ?').all(orgId);
        const reports = db.prepare('SELECT * FROM reports WHERE organization_id = ?').all(orgId);
        const targets = db.prepare('SELECT * FROM targets WHERE organization_id = ?').all(orgId);

        const exportData = {
            exportedAt: new Date().toISOString(),
            organizationId: orgId,
            users,
            metrics,
            entries,
            reports,
            targets
        };

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="sustainflow-export-${new Date().toISOString().slice(0, 10)}.json"`
            }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
