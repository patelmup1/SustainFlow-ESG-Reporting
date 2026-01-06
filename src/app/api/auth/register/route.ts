import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, loginUser } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
        }

        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json({
                error: 'Password must be at least 8 characters and include a number and a special character.'
            }, { status: 400 });
        }

        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const userId = randomUUID();
        const orgId = randomUUID();

        // Create Organization
        const orgName = `${name}'s Organization`;
        const orgStmt = db.prepare('INSERT INTO organizations (id, name, subscription_plan, status) VALUES (?, ?, ?, ?)');
        orgStmt.run(orgId, orgName, 'FREE', 'ACTIVE');

        // Seed Default Metrics
        const defaultMetrics = [
            { name: 'Electricity', code: 'ELEC-001', unit: 'kWh', factor: 0.5, category: 'Energy' },
            { name: 'Natural Gas', code: 'GAS-001', unit: 'm3', factor: 2.0, category: 'Energy' },
            { name: 'Water Usage', code: 'WATER-001', unit: 'liters', factor: 0.001, category: 'Water' },
            { name: 'Waste (Landfill)', code: 'WASTE-001', unit: 'kg', factor: 1.5, category: 'Waste' }
        ];

        const metricStmt = db.prepare('INSERT INTO metrics (id, organization_id, name, code, unit, emission_factor, category, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

        for (const m of defaultMetrics) {
            metricStmt.run(randomUUID(), orgId, m.name, m.code, m.unit, m.factor, m.category, 'NUMERIC');
        }

        const role = 'ADMIN'; // Creator is Admin

        const stmt = db.prepare('INSERT INTO users (id, organization_id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(userId, orgId, email, hashedPassword, role, name);

        const user = { id: userId, organization_id: orgId, email, role, name };
        await loginUser(user);

        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
