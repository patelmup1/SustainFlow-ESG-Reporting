'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [industry, setIndustry] = useState('Technology');

    const handleOrgUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate updating org (Mock)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        setStep(2);
    };

    const handleFinish = () => {
        router.push('/dashboard');
    };

    return (
        <div style={{ maxWidth: '600px', margin: '4rem auto', backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#0f172a' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to SustainFlow! 🌿</h1>
                <p style={{ color: '#64748b' }}>Let's get your organization set up.</p>
            </div>

            <div style={{ display: 'flex', marginBottom: '2rem', gap: '1rem' }}>
                <div style={{ flex: 1, height: '4px', backgroundColor: '#10B981', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: '4px', backgroundColor: step >= 2 ? '#10B981' : '#e2e8f0', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: '4px', backgroundColor: step >= 3 ? '#10B981' : '#e2e8f0', borderRadius: '2px' }}></div>
            </div>

            {step === 1 && (
                <form onSubmit={handleOrgUpdate}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Step 1: Organization Details</h2>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Organization Name</label>
                        <input
                            required
                            type="text"
                            value={orgName}
                            onChange={e => setOrgName(e.target.value)}
                            placeholder="My Company Inc."
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Industry</label>
                        <select
                            value={industry}
                            onChange={e => setIndustry(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }}
                        >
                            <option value="Technology">Technology</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Retail">Retail</option>
                            <option value="Energy">Energy</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Saving...' : 'Next Step'}
                    </button>
                </form>
            )}

            {step === 2 && (
                <div>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Step 2: Default Metrics</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Based on your industry ({industry}), we've added these metrics to your dashboard:</p>
                    <ul style={{ listStyle: 'none', marginBottom: '2rem', padding: 0 }}>
                        <li style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚡ Electricity (kWh)</li>
                        <li style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔥 Natural Gas (m3)</li>
                        <li style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>💧 Water Usage (liters)</li>
                    </ul>
                    <button onClick={() => setStep(3)} className="btn btn-primary" style={{ width: '100%' }}>Confirm & Continue</button>
                    <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Back</button>
                </div>
            )}

            {step === 3 && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>All Set!</h2>
                    <p style={{ marginBottom: '2rem', color: '#64748b' }}>Your dashboard is ready. Start tracking your sustainability journey today.</p>
                    <button onClick={handleFinish} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Go to Dashboard</button>
                </div>
            )}
        </div>
    );
}
