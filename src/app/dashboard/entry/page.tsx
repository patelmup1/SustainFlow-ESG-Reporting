'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DataEntryPage() {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        metric_id: '',
        value: '',
        date: new Date().toISOString().split('T')[0]
    });

    const router = useRouter();

    useEffect(() => {
        Promise.all([
            fetch('/api/metrics').then(res => res.json()),
            fetch('/api/entries').then(res => res.json())
        ]).then(([metricsData, entriesData]) => {
            if (metricsData.metrics) setMetrics(metricsData.metrics);
            if (entriesData.entries) setEntries(entriesData.entries);
            setLoading(false);

            if (metricsData.metrics && metricsData.metrics.length > 0) {
                setFormData(prev => ({ ...prev, metric_id: metricsData.metrics[0].id }));
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setFormData(prev => ({ ...prev, value: '' }));
            // Refresh entries
            const entriesRes = await fetch('/api/entries');
            const entriesData = await entriesRes.json();
            setEntries(entriesData.entries);
            router.refresh();
        }
    };

    const selectedMetric = metrics.find(m => m.id === formData.metric_id);
    const estimatedEmission = selectedMetric && formData.value
        ? (parseFloat(formData.value) * selectedMetric.emission_factor).toFixed(2)
        : '0';

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Data Entry</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>New Entry</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Metric</label>
                            {metrics.length === 0 ? (
                                <div style={{ padding: '0.75rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.5rem', color: '#c2410c', fontSize: '0.875rem' }}>
                                    No metrics found. <a href="/dashboard/metrics" style={{ textDecoration: 'underline', color: 'inherit', fontWeight: 600 }}>Create your first metric</a> to start tracking.
                                </div>
                            ) : (
                                <select
                                    className="input"
                                    value={formData.metric_id}
                                    onChange={e => setFormData({ ...formData, metric_id: e.target.value })}
                                >
                                    {metrics.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Date</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Value ({selectedMetric?.unit})
                            </label>
                            <input
                                type="number" step="any"
                                className="input"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                                required
                                placeholder="0.00"
                            />
                        </div>

                        {selectedMetric && (
                            <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem', color: '#065f46', fontSize: '0.875rem' }}>
                                <strong>Estimated Impact:</strong> {estimatedEmission} kgCO2e
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary">Submit Entry</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Recent Entries</h3>
                    {loading ? <p>Loading...</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '0.75rem' }}>Date</th>
                                        <th style={{ padding: '0.75rem' }}>Metric</th>
                                        <th style={{ padding: '0.75rem' }}>Value</th>
                                        <th style={{ padding: '0.75rem' }}>Emissions (kgCO2e)</th>
                                        <th style={{ padding: '0.75rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.length === 0 ? <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No entries found</td></tr> :
                                        entries.map(entry => (
                                            <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.75rem' }}>{new Date(entry.period_start).toLocaleDateString()}</td>
                                                <td style={{ padding: '0.75rem' }}>{entry.metric_name}</td>
                                                <td style={{ padding: '0.75rem' }}>{entry.value} {entry.metric_unit}</td>
                                                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{entry.calculated_emission.toFixed(2)}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
                                                        backgroundColor: entry.status === 'APPROVED' ? '#dcfce7' : entry.status === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
                                                        color: entry.status === 'APPROVED' ? '#166534' : entry.status === 'REJECTED' ? '#991b1b' : '#64748b'
                                                    }}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <a href={`/dashboard/entry/${entry.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>View</a>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
