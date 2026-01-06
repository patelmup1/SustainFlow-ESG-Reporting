'use client';

export default function BillingPage() {
    // Mock subscription state
    const currentPlan = 'PRO';

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Subscription & Billing</h1>

            <div className="card" style={{ backgroundColor: 'white', color: '#0f172a', padding: '2rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Current Plan</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#10B981' }}>{currentPlan}</h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Status</p>
                        <p style={{ fontWeight: 500 }}>Active</p>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>Next Billing: Jan 15, 2026</p>
                    </div>
                </div>
                <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />
                <div>
                    <h3>Included Features</h3>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {[
                            'Unlimited Users', 'Advanced Analytics', 'GRI & SASB Reporting', 'AI Insights', 'CSV Bulk Import', 'Priority Support'
                        ].map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#10B981' }}>✓</span> {f}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <h3 style={{ marginBottom: '1.5rem' }}>Available Plans</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {[
                    { name: 'Starter', price: '$49', features: ['Basic Metrics', 'Standard Reports', 'Email Support'] },
                    { name: 'Pro', price: '$199', features: ['Advanced Analytics', 'All Frameworks', 'AI Insights', 'Audit Logs'] },
                    { name: 'Enterprise', price: 'Custom', features: ['SSO', 'Custom Integrations', 'Dedicated Manager', 'SLA'] }
                ].map(plan => (
                    <div key={plan.name} style={{ backgroundColor: 'white', color: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: plan.name === 'Pro' ? '2px solid #10B981' : '1px solid #e2e8f0', position: 'relative' }}>
                        {plan.name === 'Pro' && <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10B981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem' }}>Current Plan</span>}
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{plan.name}</h4>
                        <p style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>{plan.price}<span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#64748b' }}>/mo</span></p>
                        <button
                            disabled={plan.name === 'Pro'}
                            onClick={async () => {
                                const res = await fetch('/api/billing/create-checkout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ planId: plan.name.toUpperCase() })
                                });
                                const data = await res.json();
                                if (data.url) window.location.href = data.url;
                                else alert('Error starting checkout: ' + (data.error || 'Unknown error'));
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid #10B981',
                                backgroundColor: plan.name === 'Pro' ? '#f0fdf4' : 'white',
                                color: plan.name === 'Pro' ? '#166534' : '#10B981',
                                cursor: plan.name === 'Pro' ? 'default' : 'pointer',
                                fontWeight: 500
                            }}
                        >
                            {plan.name === 'Pro' ? 'Active' : 'Upgrade'}
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Secure payment processing via Stripe (Mock). <br />
                <a href="#" style={{ color: '#10B981' }}>Manage Payment Method</a>
            </div>
        </div>
    );
}
