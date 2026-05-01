import React from 'react';

export default function Loader({ size = 40, inline = false }) {
  if (inline) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
        <circle cx="12" cy="12" r="10" stroke="rgba(112,96,255,0.2)" strokeWidth="2.5" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#7060ff" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-primary)',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
        <circle cx="12" cy="12" r="10" stroke="rgba(112,96,255,0.2)" strokeWidth="2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#7060ff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>Loading...</span>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
