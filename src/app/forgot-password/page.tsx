'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSubmitted(true);
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1rem', color: '#0f172a' }}>
            <Link href="/" style={{ fontSize: '2rem', marginBottom: '2rem', textDecoration: 'none', color: '#000000' }}>
                🌿 <span style={{ fontWeight: 700, color: '#064e3b' }}>SustainFlow</span>
            </Link>

            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {submitted ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Check your email</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                            We have sent a password reset link to <strong>{email}</strong>.
                        </p>
                        <Link href="/login" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center' }}>Reset Password</h1>
                        <p style={{ marginBottom: '2rem', color: '#64748b', textAlign: 'center' }}>Enter your email to receive instructions</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="name@company.com"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <Link href="/login" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>
                                ← Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
