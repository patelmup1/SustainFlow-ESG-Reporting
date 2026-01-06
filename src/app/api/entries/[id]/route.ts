import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session || !session.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entry = db.prepare(`
        SELECT e.*, m.name as metric_name, m.unit as metric_unit, u.name as user_name
        FROM entries e
        JOIN metrics m ON e.metric_id = m.id
        JOIN users u ON e.user_id = u.id
        WHERE e.id = ? AND e.organization_id = ?
    `).get(params.id, session.organization_id);

    if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry });
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session || !session.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, comments } = await request.json();

    // Check permissions
    // Contributors can only update their own DRAFT entries, OR add comments to any.
    // Admins can update any status.

    const entry = db.prepare('SELECT * FROM entries WHERE id = ? AND organization_id = ?').get(params.id, session.organization_id) as any;
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (status) {
        if (session.role !== 'ADMIN' && session.role !== 'GLOBAL_ADMIN') {
            // Contributor logic: Can only move DRAFT -> SUBMITTED
            if (entry.user_id !== session.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            if (status !== 'SUBMITTED') {
                return NextResponse.json({ error: 'Contributors can only submit entries' }, { status: 403 });
            }
        }
        // Admin or Valid Contributor change
        db.prepare('UPDATE entries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, params.id);

        // Audit
        db.prepare('INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            crypto.randomUUID(), session.organization_id, session.id, 'UPDATE_STATUS', 'ENTRY', params.id, `Status to ${status}`
        );
    }

    if (comments) {
        // Append comment
        // comments is JSON array.
        let existingComments = [];
        try {
            existingComments = JSON.parse(entry.comments || '[]');
        } catch (e) { }

        // New comment object
        const newComment = {
            id: crypto.randomUUID(),
            user_id: session.id,
            user_name: session.name,
            text: comments, // Expecting simple string from client for convenience, or object
            timestamp: new Date().toISOString()
        };

        existingComments.push(newComment);

        db.prepare('UPDATE entries SET comments = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(existingComments), params.id);
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session || !session.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Admin or Owner (if Draft)
    const entry = db.prepare('SELECT * FROM entries WHERE id = ? AND organization_id = ?').get(params.id, session.organization_id) as any;
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (session.role !== 'ADMIN' && session.role !== 'GLOBAL_ADMIN') {
        if (entry.user_id !== session.id || entry.status !== 'DRAFT') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    db.prepare('DELETE FROM entries WHERE id = ?').run(params.id);

    return NextResponse.json({ success: true });
}
