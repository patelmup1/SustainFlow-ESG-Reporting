import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { comparePassword, loginUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        // Mock IP - in real prod use headers().get('x-forwarded-for')
        const ip = '127.0.0.1';

        if (rateLimit(ip, 5, 60000)) { // 5 attempts per minute
            return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
        }

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

        if (!user) {
            // Audit Log (Failed Login - Unknown User)
            // Note: We can't link to org if user unknown, keeping it generic or skipping
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password_hash);

        if (!isValid) {
            // Audit Log (Failed Login)
            db.prepare('INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
                randomUUID(), user.organization_id, user.id, 'LOGIN_FAILED', 'USER', user.id, `Failed login attempt from ${ip}`
            );
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Audit Log (Success)
        db.prepare('INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            randomUUID(), user.organization_id, user.id, 'LOGIN_SUCCESS', 'USER', user.id, `Successful login from ${ip}`
        );

        await loginUser(user);

        const { password_hash, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
