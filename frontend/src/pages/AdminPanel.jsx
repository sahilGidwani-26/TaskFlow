import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import { format } from 'date-fns';

const Badge = ({ children, color = 'var(--accent)' }) => (
  <span style={{
    fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
    background: `${color}15`, color, textTransform: 'capitalize',
  }}>{children}</span>
);

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ limit: 20 });
      setUsers(res.data.data);
      setMeta(res.data.meta || {});
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      await userAPI.updateRole(id, newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await userAPI.deactivate(id);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={{ padding: '40px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', animation: 'fadeUp 0.3s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            padding: '6px 12px', background: 'var(--red-dim)', border: '1px solid rgba(255,94,125,0.3)',
            borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '700',
            color: 'var(--red)', letterSpacing: '1px',
          }}>ADMIN</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>User Management</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {meta.total ?? 0} registered users
        </p>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        animation: 'fadeUp 0.4s ease both',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
          gap: '16px',
          padding: '14px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
          letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '56px' }} />)}
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found</div>
        ) : (
          users.map((user, idx) => (
            <div
              key={user._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                gap: '16px',
                padding: '16px 20px',
                borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
                transition: 'var(--transition)',
                animation: `fadeUp 0.3s ease ${idx * 0.04}s both`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* User info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${user.role === 'admin' ? 'var(--red), #ff8060' : 'var(--accent), #b060ff'})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '12px', color: 'white',
                }}>
                  {initials(user.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Role */}
              <Badge color={user.role === 'admin' ? 'var(--red)' : 'var(--accent)'}>{user.role}</Badge>

              {/* Status */}
              <Badge color={user.isActive ? 'var(--green)' : 'var(--text-muted)'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>

              {/* Date */}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {format(new Date(user.createdAt), 'MMM d, yyyy')}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleRoleChange(user._id, user.role)}
                  title="Toggle role"
                  style={{
                    padding: '5px 10px', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)', borderRadius: '6px',
                    color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer',
                    transition: 'var(--transition)', fontWeight: '500',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {user.role === 'admin' ? '↓ Demote' : '↑ Promote'}
                </button>
                {user.isActive && (
                  <button
                    onClick={() => handleDeactivate(user._id)}
                    title="Deactivate"
                    style={{
                      padding: '5px 10px', background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)', borderRadius: '6px',
                      color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer',
                      transition: 'var(--transition)', fontWeight: '500',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    Ban
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .skeleton { background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}
