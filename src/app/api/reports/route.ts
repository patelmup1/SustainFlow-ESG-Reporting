import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET() {
    const session = await getSession();
    if (!session || !session.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const reports = db.prepare('SELECT * FROM reports WHERE organization_id = ? ORDER BY created_at DESC').all(session.organization_id);
        return NextResponse.json({ reports });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !session.organization_id || session.role === 'VIEWER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { name, type, period_start, period_end } = await request.json();

        if (!name || !type || !period_start || !period_end) {
            return NextResponse.json({ error: 'Missing required fields: name, type, period_start, or period_end' }, { status: 400 });
        }

        // 1. Gather Data for Snapshot
        // Fetch metrics and entries for the period
        const metrics = db.prepare('SELECT * FROM metrics WHERE organization_id = ? OR organization_id IS NULL').all(session.organization_id);
        const entries = db.prepare(`
            SELECT e.*, m.name as metric_name, m.unit as metric_unit 
            FROM entries e 
            JOIN metrics m ON e.metric_id = m.id 
            WHERE e.organization_id = ? AND e.period_start >= ? AND e.period_end <= ?
        `).all(session.organization_id, period_start, period_end);

        // Simple aggregation for snapshot
        const totalEmissions = entries.reduce((acc: number, e: any) => acc + (e.calculated_emission || 0), 0);

        const snapshot = {
            metrics,
            entries,
            summary: {
                totalEmissions,
                entryCount: entries.length,
                generatedAt: new Date().toISOString()
            }
        };

        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO reports (id, organization_id, name, type, period_start, period_end, data_snapshot, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, session.organization_id, name, type, period_start, period_end, JSON.stringify(snapshot), session.id);

        // Audit
        db.prepare('INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            randomUUID(), session.organization_id, session.id, 'GENERATE_REPORT', 'REPORT', id, `Generated ${type} report: ${name}`
        );

        return NextResponse.json({ success: true, id }, { status: 201 });

    } catch (error: any) {
        console.error('Report generation error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
