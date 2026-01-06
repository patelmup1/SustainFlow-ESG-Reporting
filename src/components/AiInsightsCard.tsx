'use client';

import { useState, useEffect } from 'react';

export default function AiInsightsCard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/ai/insights')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(e => setLoading(false));
    }, []);

    if (loading) return <div className="p-4 bg-white rounded shadow animate-pulse h-32"></div>;
    if (!data || data.error) return null;

    return (
        <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🤖</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#166534' }}>AI Insights</h3>
            </div>
            <p style={{ color: '#14532d', marginBottom: '1rem' }}>{data.insight}</p>
            <div style={{ fontSize: '0.875rem', color: '#15803d', fontStyle: 'italic' }}>
                💡 Tip: {data.tip}
            </div>
        </div>
    );
}
