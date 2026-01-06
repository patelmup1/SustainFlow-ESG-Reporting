'use client';

import { useState, useEffect } from 'react';

export default function TargetsPage() {
    const [targets, setTargets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        target_value: 0,
        baseline_year: new Date().getFullYear(),
        target_year: new Date().getFullYear() + 5
    });

    const fetchTargets = async () => {
        const res = await fetch('/api/targets');
        if (res.ok) {
            const data = await res.json();
            setTargets(data.targets);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTargets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/targets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            setFormData({
                name: '',
                target_value: 0,
                baseline_year: new Date().getFullYear(),
                target_year: new Date().getFullYear() + 5
            });
            fetchTargets();
        } else {
            alert('Failed to create target');
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Sustainability Targets</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Set New Target</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Goal Name</label>
                            <input
                                type="text" className="input" required
                                placeholder="e.g. Net Zero by 2030"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Target Reduction (%)</label>
                            <input
                                type="number" className="input" required
                                placeholder="e.g. 50"
                                value={formData.target_value} onChange={e => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Baseline Year</label>
                                <input
                                    type="number" className="input" required
                                    value={formData.baseline_year} onChange={e => setFormData({ ...formData, baseline_year: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Target Year</label>
                                <input
                                    type="number" className="input" required
                                    value={formData.target_year} onChange={e => setFormData({ ...formData, target_year: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Set Target</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Active Targets</h3>
                    {loading ? <p>Loading...</p> : targets.length === 0 ? <p style={{ color: '#64748b' }}>No targets set yet.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {targets.map(t => (
                                <div key={t.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong>{t.name}</strong>
                                        <span style={{ color: '#10B981', fontWeight: 600 }}>Target: {t.target_value}% reduction</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        Timeline: {t.baseline_year} → {t.target_year}
                                    </div>
                                    {/* Progress bar placeholder - fully implementing requires calculating progress vs baseline */}
                                    <div style={{ marginTop: '0.75rem', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: '25%', height: '100%', backgroundColor: '#10B981' }}></div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', textAlign: 'right', color: '#64748b' }}>25% Progress (Simulated)</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .card { background: white; padding: 1.5rem; borderRadius: 0.5rem; boxShadow: 0 1px 2px rgba(0,0,0,0.05); }
                .input { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; borderRadius: 0.375rem; }
            `}</style>
        </div>
    );
}
