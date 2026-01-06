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
        // Fetch organization specific metrics AND system global metrics (organization_id IS NULL)
        const metrics = db.prepare('SELECT * FROM metrics WHERE organization_id = ? OR organization_id IS NULL ORDER BY created_at DESC').all(session.organization_id);
        return NextResponse.json({ metrics });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !session.organization_id || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { name, code, unit, emission_factor, category, type } = await request.json();

        if (!name || !code || !unit) {
            return NextResponse.json({ error: 'Name, code, and unit are required' }, { status: 400 });
        }

        const id = randomUUID();
        // Insert with organization_id
        const stmt = db.prepare(
            'INSERT INTO metrics (id, organization_id, name, code, unit, emission_factor, category, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        stmt.run(id, session.organization_id, name, code, unit, emission_factor || 0, category || 'Other', type || 'NUMERIC');

        // Audit Log
        db.prepare('INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            randomUUID(), session.organization_id, session.id, 'CREATE_METRIC', 'METRIC', id, `Created metric: ${name}`
        );

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
