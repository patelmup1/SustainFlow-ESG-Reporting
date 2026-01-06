import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/lib/db';

import { hasFeature } from '@/lib/plans';

export async function GET() {
    const session = await getSession();
    if (!session || !session.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const org = db.prepare('SELECT subscription_plan FROM organizations WHERE id = ?').get(session.organization_id) as any;
        const plan = org?.subscription_plan || 'FREE';

        if (!hasFeature(plan, 'AI_INSIGHTS')) {
            return NextResponse.json({
                error: 'Upgrade to Pro to access AI Insights',
                upgradeRequired: true
            }, { status: 403 });
        }
        // Fetch simple stats to "generate" insight
        // For MVP mock, we just look at the trend direction
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);

        // Get total emissions for current vs last month
        // Note: 'date'/'period_start' handling. 
        // We use string match for simplicity in this mock or sqlite strftime

        const stmt = db.prepare(`
            SELECT strftime('%Y-%m', period_start) as month, SUM(calculated_emission) as total
            FROM entries
            WHERE organization_id = ? AND (month = ? OR month = ?)
            GROUP BY month
        `);

        const data = stmt.all(session.organization_id, currentMonth, lastMonth) as any[];

        const currentVal = data.find(d => d.month === currentMonth)?.total || 0;
        const lastVal = data.find(d => d.month === lastMonth)?.total || 0;

        let insight = "";

        if (currentVal === 0 && lastVal === 0) {
            insight = "No data available yet for recent months to generate insights. Start adding entries!";
        } else if (currentVal < lastVal) {
            const diff = lastVal - currentVal;
            const pct = lastVal > 0 ? ((diff / lastVal) * 100).toFixed(1) : 0;
            insight = `Great job! Your emissions decreased by ${pct}% this month compared to last month. Keep optimizing your energy usage.`;
        } else if (currentVal > lastVal) {
            const diff = currentVal - lastVal;
            const pct = lastVal > 0 ? ((diff / lastVal) * 100).toFixed(1) : 100;
            insight = `Attention: Your emissions increased by ${pct}% compared to last month. Check for unusual activity in your highest consumption categories.`;
        } else {
            insight = "Your emissions are stable compared to last month.";
        }

        // Add a random generic tip
        const tips = [
            "Consider switching to LED lighting in Office B.",
            "Review your HVAC schedules to reduce off-hour consumption.",
            "Your Scope 2 emissions (Electricity) are your largest contributor this quarter.",
            "Vehicle fleet usage has been higher than average this week."
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];

        return NextResponse.json({
            insight,
            tip: randomTip,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
