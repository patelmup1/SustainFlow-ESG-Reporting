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
        let stmt;
        if (session.role === 'ADMIN' || session.role === 'GLOBAL_ADMIN') {
            stmt = db.prepare(`
            SELECT e.*, m.name as metric_name, m.unit as metric_unit, u.name as user_name 
            FROM entries e 
            JOIN metrics m ON e.metric_id = m.id 
            JOIN users u ON e.user_id = u.id 
            WHERE e.organization_id = ?
            ORDER BY e.period_start DESC
        `);
        } else {
            console.log("Fetching entries for user:", session.id);
            stmt = db.prepare(`
            SELECT e.*, m.name as metric_name, m.unit as metric_unit 
            FROM entries e 
            JOIN metrics m ON e.metric_id = m.id 
            WHERE e.organization_id = ? AND e.user_id = ? 
            ORDER BY e.period_start DESC
        `);
        }

        const entries = (session.role === 'ADMIN' || session.role === 'GLOBAL_ADMIN') ? stmt.all(session.organization_id) : stmt.all(session.organization_id, session.id);
        return NextResponse.json({ entries });
    } catch (error) {
        console.error("GET entries error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !session.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { metric_id, value, date } = await request.json();

        if (!metric_id || !value || !date) {
            return NextResponse.json({ error: 'Metric, value, and date are required' }, { status: 400 });
        }

        // Check if metric exists and matches org (or is global)
        const metric = db.prepare('SELECT * FROM metrics WHERE id = ? AND (organization_id = ? OR organization_id IS NULL)').get(metric_id, session.organization_id) as any;
        if (!metric) {
            return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
        }

        const valNum = parseFloat(value);
        // Use restored emission_factor column
        const calculated_emission = isNaN(valNum) ? 0 : valNum * (metric.emission_factor || 0);

        const id = randomUUID();
        // date -> period_start, period_end
        // status -> DRAFT
        const stmt = db.prepare(
            'INSERT INTO entries (id, organization_id, metric_id, user_id, value, period_start, period_end, calculated_emission, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        stmt.run(id, session.organization_id, metric_id, session.id, value, date, date, calculated_emission, 'DRAFT');

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
