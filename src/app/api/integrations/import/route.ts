import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !session.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { rows, mapping } = await request.json();
        // rows: Array of objects (row data) or array of arrays? 
        // Let's assume frontend sends Array of objects keyed by header, OR Array of rows + headers.
        // Simplified: Frontend sends parsed JSON rows `[{ "ColA": "val", ... }]` and mapping `{"metric_code": "ColA", "date": "ColB", "value": "ColC"}`.

        if (!rows || !mapping || rows.length === 0) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        const successCount = 0;
        const errors = [];

        // Cache metrics for org to validate codes
        const metrics = db.prepare('SELECT id, code, emission_factor FROM metrics WHERE organization_id = ? OR organization_id IS NULL').all(session.organization_id) as any[];
        const metricMap = new Map(metrics.map(m => [m.code, m]));

        const insertStmt = db.prepare(`
            INSERT INTO entries (id, organization_id, metric_id, user_id, value, period_start, period_end, calculated_emission, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const MAX_ROWS = 500;
        if (rows.length > MAX_ROWS) {
            return NextResponse.json({ error: `Start small! Max ${MAX_ROWS} rows per import.` }, { status: 400 });
        }

        const transaction = db.transaction((rowsToInsert) => {
            for (const row of rowsToInsert) {
                const code = row[mapping.metric_code]?.trim();
                const dateStr = row[mapping.date]?.trim(); // YYYY-MM-DD
                const valStr = row[mapping.value];

                if (!code || !dateStr || !valStr) {
                    // Skip row or log error
                    continue;
                }

                const metric = metricMap.get(code);
                if (!metric) {
                    // Metric code not found
                    continue;
                }

                const valNum = parseFloat(valStr);
                if (isNaN(valNum)) continue;

                // Calc emission
                const emission = valNum * (metric.emission_factor || 0);

                insertStmt.run(
                    randomUUID(),
                    session.organization_id,
                    metric.id,
                    session.id,
                    valStr,
                    dateStr,
                    dateStr, // Single date -> start/end same
                    emission,
                    'DRAFT' // Imports start as DRAFT
                );
            }
        });

        try {
            transaction(rows);

            // Audit Log
            db.prepare('INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, details) VALUES (?, ?, ?, ?, ?, ?)').run(
                randomUUID(), session.organization_id, session.id, 'IMPORT_DATA', 'ENTRY', `Imported ${rows.length} rows via CSV`
            );

        } catch (e: any) {
            console.error('Import transaction failed', e);
            return NextResponse.json({ error: 'Import failed: ' + e.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: rows.length });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
