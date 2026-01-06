'use client';

import { useState, useEffect } from 'react';

export default function AuditLogPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/audit-logs')
            .then(res => res.json())
            .then(data => {
                if (data.logs) setLogs(data.logs);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Audit Log</h1>
            <div className="card" style={{ backgroundColor: 'white', color: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {loading ? <p>Loading logs...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '0.75rem' }}>Time</th>
                                <th style={{ padding: '0.75rem' }}>User</th>
                                <th style={{ padding: '0.75rem' }}>Action</th>
                                <th style={{ padding: '0.75rem' }}>Entity</th>
                                <th style={{ padding: '0.75rem' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{log.user_name || 'System'}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{log.action}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                            {log.entity_type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem', color: '#475569' }}>{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && logs.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No audit logs found.</p>}
            </div>
        </div>
    );
}
