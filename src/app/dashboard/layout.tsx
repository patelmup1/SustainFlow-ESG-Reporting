import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ width: '250px', backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ color: 'var(--primary)' }}>SustainFlow</h2>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>
                            <Link href="/dashboard" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--foreground)' }} className="hover:bg-slate-100">
                                Overview
                            </Link>
                        </li>

                        {user.role === 'ADMIN' && (
                            <>
                                <li>
                                    <Link href="/dashboard/metrics" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--foreground)' }}>
                                        Metrics
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dashboard/users" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--foreground)' }}>
                                        Users
                                    </Link>
                                </li>
                            </>
                        )}

                        <li>
                            <Link href="/dashboard/entry" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--foreground)' }}>
                                Data Entry
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard/reports" style={{ display: 'block', padding: '0.75rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--foreground)' }}>
                                Reports
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.role}</p>
                    </div>
                    {/* Logout handled via client component usually, but for now simple link/form */}
                    {/* We need a logout button. I'll make a small client component or just a form action if server actions were used, but here api. */}
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, backgroundColor: 'var(--background)' }}>
                <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Dashboard</h3>
                    {/* Logout Button would go here */}
                </header>
                <div style={{ padding: '2rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
