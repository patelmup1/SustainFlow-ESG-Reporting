import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', color: '#0f172a' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#064e3b' }}>
          <span style={{ fontSize: '2rem' }}>🌿</span> SustainFlow
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" style={{ textDecoration: 'none', color: '#334155', fontWeight: 500 }}>Login</Link>
          <Link href="/register" style={{ textDecoration: 'none', backgroundColor: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 500 }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%)',
        padding: '6rem 2rem',
        textAlign: 'center',
        borderRadius: '0 0 50% 50% / 4rem',
        marginBottom: '4rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, display: 'inline-block', marginBottom: '1.5rem' }}>
            New: AI Insights & GRI Reporting
          </span>
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>
            Enterprise ESG Management <br />
            <span style={{ color: '#10B981', backgroundImage: 'linear-gradient(to right, #10B981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reimagined.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Streamline your sustainability reporting, track multi-tenant data, and generate GRI-compliant reports in minutes, not months.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/register" style={{ backgroundColor: '#10B981', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)' }}>
              Start Free Trial
            </Link>
            <Link href="/login" style={{ backgroundColor: 'white', color: '#0f172a', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              View Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem' }}>Everything you need to reach Net Zero</h2>
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>Comprehensive tools for the modern sustainability team.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {[
            { icon: '📊', title: 'Advanced Analytics', desc: 'Real-time dashboards with breakdown by category, year, and business unit.' },
            { icon: '📑', title: 'GRI & SASB Reporting', desc: 'Generate compliance-ready PDF reports with one click using standard frameworks.' },
            { icon: '🤖', title: 'AI Insights', desc: 'Get automated recommendations to reduce your carbon footprint based on your data.' },
            { icon: '🌍', title: 'Multi-Tenancy', desc: 'Manage multiple subsidiaries or client organizations with strict data isolation.' },
            { icon: '🎯', title: 'Goal Tracking', desc: 'Set reduction targets and track progress against baseline years automatically.' },
            { icon: '🤝', title: 'Collaboration', desc: 'Streamline data collection with approval workflows and audit logs.' }
          ].map((f, i) => (
            <div key={i} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: '#64748b', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '4rem 2rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>🌿 SustainFlow</div>
            <p>Empowering organizations to build a sustainable future through data-driven insights.</p>
          </div>
          <div style={{ display: 'flex', gap: '4rem' }}>
            <div>
              <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', marginTop: '3rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          © 2025 SustainFlow Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
