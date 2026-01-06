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
        const targets = db.prepare('SELECT * FROM targets WHERE organization_id = ? ORDER BY created_at DESC').all(session.organization_id);
        return NextResponse.json({ targets });
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
        const { name, target_value, baseline_year, target_year } = await request.json();

        if (!name || !target_value || !target_year) {
            return NextResponse.json({ error: 'Name, target value, and target year are required' }, { status: 400 });
        }

        const id = randomUUID();
        // Simplified: category link optional, metric_id optional.
        // Schema: id, organization_id, metric_id, category, name, target_value, baseline_year, target_year, created_at

        const stmt = db.prepare(`
            INSERT INTO targets (id, organization_id, name, target_value, baseline_year, target_year)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, session.organization_id, name, target_value, baseline_year || new Date().getFullYear(), target_year);

        // Audit
        db.prepare('INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            randomUUID(), session.organization_id, session.id, 'CREATE_TARGET', 'TARGET', id, `Created target: ${name}`
        );

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
