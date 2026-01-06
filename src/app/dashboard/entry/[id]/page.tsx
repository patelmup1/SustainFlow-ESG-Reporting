'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EntryDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [entry, setEntry] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Mock user role - in real app, fetch from session/context
    // For now assuming we have buttons and API enforces permissions.
    // UI simply shows actions.

    const fetchEntry = async () => {
        const res = await fetch(`/api/entries/${id}`);
        if (res.ok) {
            const data = await res.json();
            setEntry(data.entry);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (id) fetchEntry();
    }, [id]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Change status to ${newStatus}?`)) return;
        await fetch(`/api/entries/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        fetchEntry();
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmitting(true);
        await fetch(`/api/entries/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comments: commentText })
        });
        setCommentText('');
        setSubmitting(false);
        fetchEntry();
    };

    if (loading) return <div>Loading...</div>;
    if (!entry) return <div>Entry not found</div>;

    const comments = entry.comments ? JSON.parse(entry.comments) : [];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => router.back()} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>← Back to Entries</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Entry Details</h1>
                <span style={{
                    padding: '0.5rem 1rem', borderRadius: '999px', fontWeight: 600,
                    backgroundColor: entry.status === 'APPROVED' ? '#dcfce7' : entry.status === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
                    color: entry.status === 'APPROVED' ? '#166534' : entry.status === 'REJECTED' ? '#991b1b' : '#64748b'
                }}>
                    {entry.status}
                </span>
            </div>

            <div className="card" style={{ backgroundColor: 'white', color: '#0f172a', padding: '2rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Metric</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{entry.metric_name}</p>
                </div>
                <div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Value</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{entry.value} {entry.metric_unit}</p>
                </div>
                <div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Date</p>
                    <p style={{ fontSize: '1.125rem' }}>{entry.period_start}</p>
                </div>
                <div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Calculated Emissions</p>
                    <p style={{ fontSize: '1.125rem' }}>{entry.calculated_emission.toFixed(2)} kgCO2e</p>
                </div>
                <div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Submitted By</p>
                    <p>{entry.user_name}</p>
                </div>
            </div>

            {/* Workflow Actions */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                {entry.status === 'DRAFT' && (
                    <button onClick={() => handleStatusUpdate('SUBMITTED')} className="btn btn-primary" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                        Submit for Approval
                    </button>
                )}
                {/* Admin Actions - Ideally check role, but server enforces. Just show button for now. */}
                {entry.status === 'SUBMITTED' && (
                    <>
                        <button onClick={() => handleStatusUpdate('APPROVED')} className="btn" style={{ backgroundColor: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                            Approve
                        </button>
                        <button onClick={() => handleStatusUpdate('REJECTED')} className="btn" style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                            Reject
                        </button>
                    </>
                )}
            </div>

            {/* Comments Section */}
            <div>
                <h3>Comments & Activity</h3>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {comments.map((c: any) => (
                        <div key={c.id} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 600 }}>{c.user_name}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(c.timestamp).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: 0 }}>{c.text}</p>
                        </div>
                    ))}
                    {comments.length === 0 && <p style={{ color: '#cbd5e1', fontStyle: 'italic' }}>No comments yet.</p>}
                </div>

                <form onSubmit={handlePostComment} style={{ marginTop: '2rem' }}>
                    <textarea
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Add a comment or note..."
                        className="input"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', minHeight: '100px' }}
                    />
                    <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ backgroundColor: '#0f172a', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                            Post Comment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
