'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewReportPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'BASIC',
        period_start: '',
        period_end: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/dashboard/reports');
            } else {
                const data = await res.json();
                alert(`Failed to generate report: ${data.error}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Error generating report: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Generate New Report</h1>

            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', color: '#0f172a', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Report Name</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                        placeholder="e.g. Q1 2025 Sustainability Summary"
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Framework / Type</label>
                    <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                    >
                        <option value="BASIC">Basic ESG Summary</option>
                        <option value="GRI">GRI-style Report (Lite)</option>
                        <option value="SASB">SASB Investor Summary</option>
                        <option value="CSRD">CSRD Overview</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Period Start</label>
                        <input
                            required
                            type="date"
                            value={formData.period_start}
                            onChange={e => setFormData({ ...formData, period_start: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Period End</label>
                        <input
                            required
                            type="date"
                            value={formData.period_end}
                            onChange={e => setFormData({ ...formData, period_end: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', backgroundColor: 'transparent', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: '#10B981', color: 'white', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}
                    >
                        {submitting ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </form>
        </div>
    );
}
