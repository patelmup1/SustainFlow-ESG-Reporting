'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReportsListPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports')
            .then(res => res.json())
            .then(data => {
                if (data.reports) setReports(data.reports);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Reports</h1>
                <Link href="/dashboard/reports/new" className="btn btn-primary" style={{ textDecoration: 'none', backgroundColor: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem' }}>
                    Generate New Report
                </Link>
            </div>

            {loading ? (
                <div>Loading reports...</div>
            ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #cbd5e1', borderRadius: '0.5rem' }}>
                    <p style={{ color: '#64748b' }}>No reports generated yet.</p>
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', color: '#0f172a', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Period</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Created At</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => (
                            <tr key={report.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem' }}>{report.name}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                                        {report.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{report.period_start} to {report.period_end}</td>
                                <td style={{ padding: '1rem' }}>{new Date(report.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <Link href={`/dashboard/reports/${report.id}`} style={{ color: '#10B981', textDecoration: 'none', fontWeight: 500 }}>
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
