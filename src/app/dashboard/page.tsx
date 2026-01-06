'use client';

import { useEffect, useState } from 'react';
import { EmissionsTrendChart, CategoryBreakdownChart } from '@/components/DashboardCharts';
import AiInsightsCard from '@/components/AiInsightsCard';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState<string>(''); // Empty for 'Last 12 months'

    useEffect(() => {
        setLoading(true);
        const query = year ? `?year=${year}` : '';
        fetch(`/api/dashboard/stats${query}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setStats(null); // Or state to show error
                setLoading(false);
            });
    }, [year]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
    if (!stats || stats.error) return <div style={{ padding: '2rem' }}>Error loading stats. Please try logging in again.</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Overview</h2>
                <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                >
                    <option value="">Last 12 Months</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                </select>
            </div>

            <AiInsightsCard />

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total Emissions</p>
                    <p style={{ fontSize: '2rem', fontWeight: 600 }}>{stats.totalEmissions.toFixed(2)} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>kgCO2e</span></p>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total Entries</p>
                    <p style={{ fontSize: '2rem', fontWeight: 600 }}>{stats.entryCount}</p>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Pending Approval</p>
                    <p style={{ fontSize: '2rem', fontWeight: 600 }}>{stats.pendingCount}</p>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Emissions Trend</h3>
                    {stats.trend.length > 0 ? (
                        <EmissionsTrendChart data={stats.trend} />
                    ) : (
                        <p style={{ color: '#64748b' }}>No data available for trends.</p>
                    )}
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Category Breakdown</h3>
                    {stats.byCategory.length > 0 ? (
                        <CategoryBreakdownChart data={stats.byCategory} />
                    ) : (
                        <p style={{ color: '#64748b' }}>No data available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
