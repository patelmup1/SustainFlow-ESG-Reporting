'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Mock chart component since we can't easily reuse the 'EmissionsTrendChart' without passing data prop correctly
// Assuming DashboardCharts exports simple components or we can just render tables for the report view.

export default function ReportViewPage() {
    const { id } = useParams();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetch(`/api/reports/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.report) {
                        // Parse snapshot
                        data.report.snapshot = JSON.parse(data.report.data_snapshot);
                        setReport(data.report);
                    }
                    setLoading(false);
                })
                .catch(err => setLoading(false));
        }
    }, [id]);

    if (loading) return <div>Loading report details...</div>;
    if (!report) return <div>Report not found</div>;

    const { snapshot, name, type, period_start, period_end } = report;
    const { summary, entries } = snapshot;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="no-print">
                <h1 style={{ fontSize: '1.5rem' }}>{name}</h1>
                <button onClick={() => window.print()} className="btn btn-primary" style={{ backgroundColor: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                    Download PDF
                </button>
            </div>

            <div className="report-container" style={{ backgroundColor: 'white', color: '#0f172a', padding: '3rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ borderBottom: '2px solid #10B981', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>SustainFlow Reports</h2>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>{type} Framework</span>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <p><strong>Reporting Period:</strong> {period_start} to {period_end}</p>
                    <p><strong>Generated On:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Executive Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Emissions</p>
                            <p style={{ fontSize: '2rem', fontWeight: 600 }}>{summary.totalEmissions.toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 400 }}>kgCO2e</span></p>
                        </div>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Data Points</p>
                            <p style={{ fontSize: '2rem', fontWeight: 600 }}>{summary.entryCount}</p>
                        </div>
                    </div>
                </div>

                {type === 'GRI' && (
                    <div style={{ marginBottom: '2rem', border: '1px solid #blue', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#eff6ff' }}>
                        <h4>GRI 305: Emissions</h4>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            Reported in accordance with GRI Standards.
                            Direct (Scope 1) and Energy Indirect (Scope 2) emissions are calculated based on consumption data provided.
                        </p>
                    </div>
                )}

                <div style={{ marginBottom: '2rem' }}>
                    <h3>Data Breakdown</h3>
                    <br />
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>Metric</th>
                                <th style={{ padding: '0.5rem' }}>Period</th>
                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Consumption</th>
                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Emissions (kgCO2e)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((e: any) => (
                                <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.5rem' }}>{e.metric_name}</td>
                                    <td style={{ padding: '0.5rem' }}>{e.period_start}</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{e.value} {e.metric_unit}</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{e.calculated_emission.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '4rem' }}>
                    Powered by SustainFlow Cloud
                </div>
            </div>
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background-color: white; }
                    nav, aside { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    .report-container { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; maxWidth: 100% !important; }
                }
            `}</style>
        </div>
    );
}
