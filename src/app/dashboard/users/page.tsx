'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '', // Should be temporary or invite link in real app
        role: 'CONTRIBUTOR'
    });
    const router = useRouter();

    const fetchUsers = async () => {
        const res = await fetch('/api/users');
        if (res.ok) {
            const data = await res.json();
            setUsers(data.users);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setFormData({ name: '', email: '', password: '', role: 'CONTRIBUTOR' });
            fetchUsers();
            router.refresh();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchUsers();
        } else {
            alert('Failed to delete');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: 0 }}>User Management</h1>
                <a href="/api/admin/export" target="_blank" style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', textDecoration: 'none', color: '#475569', fontSize: '0.875rem' }}>
                    📥 Export Data
                </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Add New User</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                        Create a user directly with a password for MVP.
                    </p>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Name</label>
                            <input
                                type="text" className="input" required
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email</label>
                            <input
                                type="email" className="input" required
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Temporary Password</label>
                            <input
                                type="password" className="input" required
                                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Role</label>
                            <select className="input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <option value="CONTRIBUTOR">Contributor</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Create User</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Existing Users</h3>
                    {loading ? <p>Loading...</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '0.75rem' }}>Name</th>
                                        <th style={{ padding: '0.75rem' }}>Email</th>
                                        <th style={{ padding: '0.75rem' }}>Role</th>
                                        <th style={{ padding: '0.75rem' }}>Created</th>
                                        <th style={{ padding: '0.75rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem' }}>{user.name}</td>
                                            <td style={{ padding: '0.75rem' }}>{user.email}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                                    backgroundColor: user.role === 'ADMIN' ? '#e0f2fe' : '#f1f5f9',
                                                    color: user.role === 'ADMIN' ? '#0369a1' : '#475569'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <button onClick={() => handleDelete(user.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
