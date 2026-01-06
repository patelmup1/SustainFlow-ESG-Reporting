'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IntegrationsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [parsedRows, setParsedRows] = useState<any[]>([]);
    const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Processing

    // Mapping keys: metric_code, date, value
    const [mapping, setMapping] = useState({
        metric_code: '',
        date: '',
        value: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const parseCSV = () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            const lines = text.split('\n');
            if (lines.length < 2) {
                alert('File is empty or invalid');
                return;
            }

            const headerLine = lines[0].trim();
            const headers = headerLine.split(',').map(h => h.trim());
            setHeaders(headers);

            // Parse objects
            const rows = lines.slice(1).map(line => {
                if (!line.trim()) return null;
                const vals = line.split(',');
                const obj: any = {};
                headers.forEach((h, i) => {
                    obj[h] = vals[i]?.trim();
                });
                return obj;
            }).filter(r => r !== null);

            setParsedRows(rows);
            setStep(2);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        setStep(3);
        const res = await fetch('/api/integrations/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: parsedRows, mapping })
        });

        if (res.ok) {
            const data = await res.json();
            alert(`Successfully imported ${data.count} rows!`);
            setStep(1);
            setFile(null);
            setParsedRows([]);
            setHeaders([]);
        } else {
            alert('Import failed. Check your data format or mapping.');
            setStep(2);
        }
    };

    const autoMap = () => {
        // Simple heuristic
        const newMap = { ...mapping };
        headers.forEach(h => {
            const lower = h.toLowerCase();
            if (lower.includes('code') || lower.includes('metric')) newMap.metric_code = h;
            if (lower.includes('date') || lower.includes('period') || lower.includes('time')) newMap.date = h;
            if (lower.includes('value') || lower.includes('amount') || lower.includes('quantity')) newMap.value = h;
        });
        setMapping(newMap);
    };

    // Auto-map when step 2 opens
    if (step === 2 && !mapping.metric_code) autoMap();

    return (
        <div>
            <h1>Integrations & Data Import</h1>

            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                {/* Left: CSV Import */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>CSV Bulk Import</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Upload your historical data or bulk entries. Ensure your CSV has columns for Metric Code, Date (YYYY-MM-DD), and Value.</p>

                    {step === 1 && (
                        <div>
                            <input type="file" accept=".csv" onChange={handleFileChange} style={{ marginBottom: '1rem', display: 'block' }} />
                            <button
                                onClick={parseCSV}
                                disabled={!file}
                                className="btn btn-primary"
                                style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', opacity: !file ? 0.5 : 1 }}
                            >
                                Next: Map Columns
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Metric Code Column</label>
                                <select className="input" value={mapping.metric_code} onChange={e => setMapping({ ...mapping, metric_code: e.target.value })}>
                                    <option value="">Select Column...</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date Column</label>
                                <select className="input" value={mapping.date} onChange={e => setMapping({ ...mapping, date: e.target.value })}>
                                    <option value="">Select Column...</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Value Column</label>
                                <select className="input" value={mapping.value} onChange={e => setMapping({ ...mapping, value: e.target.value })}>
                                    <option value="">Select Column...</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={handleImport}
                                className="btn btn-primary"
                                style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem' }}
                            >
                                Start Import ({parsedRows.length} rows)
                            </button>
                            <button onClick={() => setStep(1)} style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div>Processing import... Please wait.</div>
                    )}
                </div>

                {/* Right: Placeholders */}
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Available Integrations</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#f8fafc', opacity: 0.7 }}>
                            <strong>ERP Connector</strong>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Connect SAP, Oracle, or NetSuite (Coming Soon)</p>
                        </div>
                        <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#f8fafc', opacity: 0.7 }}>
                            <strong>Energy Utility API</strong>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Auto-sync with utility providers (Enterprise Only)</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .card { background: white; padding: 2rem; borderRadius: 0.5rem; boxShadow: 0 1px 3px rgba(0,0,0,0.1); }
                .input { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; borderRadius: 0.375rem; }
            `}</style>
        </div>
    );
}
