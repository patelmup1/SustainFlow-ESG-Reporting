import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session || !session.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year'); // Optional year filter

    try {
        // Total Emissions
        let totalEmissions = 0;
        let entryCount = 0;
        let pendingCount = 0;

        // Monthly Trend (Last 12 months)
        let trend: any[] = [];

        // Category Breakdown
        let byCategory: any[] = [];

        // Base filter conditions
        let dateFilter = "";
        let params: any[] = [];

        if (year) {
            dateFilter = "AND strftime('%Y', period_start) = ?";
            params.push(year);
        }

        if (session.role === 'ADMIN' || session.role === 'GLOBAL_ADMIN') {
            const stats = db.prepare(`
                SELECT 
                    SUM(calculated_emission) as total_emissions,
                    COUNT(*) as entry_count,
                    SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) as pending_count
                FROM entries
                WHERE organization_id = ? ${dateFilter}
            `).get(session.organization_id, ...params) as any;

            totalEmissions = stats.total_emissions || 0;
            entryCount = stats.entry_count || 0;
            pendingCount = stats.pending_count || 0;

            // Trend: If year selected, show monthly for that year. If no year, last 12 months.
            if (year) {
                trend = db.prepare(`
                    SELECT strftime('%Y-%m', period_start) as month, SUM(calculated_emission) as value
                    FROM entries
                    WHERE organization_id = ? ${dateFilter}
                    GROUP BY month
                    ORDER BY month ASC
                `).all(session.organization_id, ...params);
            } else {
                trend = db.prepare(`
                    SELECT strftime('%Y-%m', period_start) as month, SUM(calculated_emission) as value
                    FROM entries
                    WHERE organization_id = ?
                    GROUP BY month
                    ORDER BY month ASC
                    LIMIT 12
                `).all(session.organization_id);
            }

            byCategory = db.prepare(`
                SELECT m.category, SUM(e.calculated_emission) as value
                FROM entries e
                JOIN metrics m ON e.metric_id = m.id
                WHERE e.organization_id = ? ${dateFilter.replace('period_start', 'e.period_start')}
                GROUP BY m.category
            `).all(session.organization_id, ...params);

        } else {
            // Contributor View (Show their own stats)
            const stats = db.prepare(`
                SELECT 
                    SUM(calculated_emission) as total_emissions,
                    COUNT(*) as entry_count,
                    SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as pending_count
                FROM entries
                WHERE organization_id = ? AND user_id = ? ${dateFilter}
            `).get(session.organization_id, session.id, ...params) as any;

            totalEmissions = stats.total_emissions || 0;
            entryCount = stats.entry_count || 0;
            pendingCount = stats.pending_count || 0; // Drafts are pending for them

            if (year) {
                trend = db.prepare(`
                    SELECT strftime('%Y-%m', period_start) as month, SUM(calculated_emission) as value
                    FROM entries
                    WHERE organization_id = ? AND user_id = ? ${dateFilter}
                    GROUP BY month
                    ORDER BY month ASC
                `).all(session.organization_id, session.id, ...params);
            } else {
                trend = db.prepare(`
                    SELECT strftime('%Y-%m', period_start) as month, SUM(calculated_emission) as value
                    FROM entries
                    WHERE organization_id = ? AND user_id = ?
                    GROUP BY month
                    ORDER BY month ASC
                    LIMIT 12
                `).all(session.organization_id, session.id);
            }

            byCategory = db.prepare(`
                SELECT m.category, SUM(e.calculated_emission) as value
                FROM entries e
                JOIN metrics m ON e.metric_id = m.id
                WHERE e.organization_id = ? AND e.user_id = ? ${dateFilter.replace('period_start', 'e.period_start')}
                GROUP BY m.category
            `).all(session.organization_id, session.id, ...params);
        }

        return NextResponse.json({
            totalEmissions,
            entryCount,
            pendingCount,
            trend,
            byCategory
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
