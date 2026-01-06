'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MetricsPage() {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        unit: '',
        emission_factor: 0,
        category: 'Energy',
        type: 'NUMERIC'
    });
    const router = useRouter();

    const fetchMetrics = async () => {
        const res = await fetch('/api/metrics');
        if (res.ok) {
            const data = await res.json();
            setMetrics(data.metrics);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setFormData({ name: '', code: '', unit: '', emission_factor: 0, category: 'Energy', type: 'NUMERIC' });
            fetchMetrics();
            router.refresh();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/metrics/${id}`, { method: 'DELETE' });
        fetchMetrics();
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>ESG Metrics Management</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Add New Metric</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Name</label>
                            <input
                                type="text" className="input" required
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Natural Gas"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Code (Unique)</label>
                            <input
                                type="text" className="input" required
                                value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. natural_gas"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Unit</label>
                                <input
                                    type="text" className="input" required
                                    value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder="e.g. m3"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Factor (kgCO2e)</label>
                                <input
                                    type="number" step="0.0001" className="input"
                                    value={formData.emission_factor} onChange={e => setFormData({ ...formData, emission_factor: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Category</label>
                            <select className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="Energy">Energy</option>
                                <option value="Waste">Waste</option>
                                <option value="Water">Water</option>
                                <option value="Social">Social</option>
                                <option value="Governance">Governance</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add Metric</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Existing Metrics</h3>
                    {loading ? <p>Loading...</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '0.75rem' }}>Name</th>
                                        <th style={{ padding: '0.75rem' }}>Code</th>
                                        <th style={{ padding: '0.75rem' }}>Unit</th>
                                        <th style={{ padding: '0.75rem' }}>Factor</th>
                                        <th style={{ padding: '0.75rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map((metric) => (
                                        <tr key={metric.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem' }}>{metric.name}</td>
                                            <td style={{ padding: '0.75rem', color: '#64748b' }}>{metric.code}</td>
                                            <td style={{ padding: '0.75rem' }}>{metric.unit}</td>
                                            <td style={{ padding: '0.75rem' }}>{metric.emission_factor}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <button onClick={() => handleDelete(metric.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                    Delete
                                                </button>
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
