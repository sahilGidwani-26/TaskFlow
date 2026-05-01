import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../components/AuthContext';
import Loader from '../components/Loader';

const InputField = ({ label, type = 'text', value, onChange, placeholder, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        outline: 'none',
        transition: 'var(--transition)',
        width: '100%',
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
      onBlur={(e) => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
    />
    {error && <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>}
  </div>
);

export default function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data.data;
      setAuth(token, user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(112,96,255,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px',
        animation: 'fadeIn 0.5s ease',
        position: 'relative',
        boxShadow: 'var(--shadow-card), var(--shadow-glow)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>
            Task<span style={{ color: 'var(--accent)' }}>Flow</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            error={errors.email}
          />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            error={errors.password}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '13px',
              background: loading ? 'rgba(112,96,255,0.5)' : 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent-light)'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent)'; }}
          >
            {loading ? <><Loader size={18} inline /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '500' }}>
            Create one
          </Link>
        </p>

        {/* Demo hint */}
        <div style={{
          marginTop: '20px', padding: '12px 16px',
          background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-secondary)',
        }}>
          <strong style={{ color: 'var(--accent-light)' }}>Demo:</strong> Register a new account to get started
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
