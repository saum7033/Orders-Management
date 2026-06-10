import React from 'react';

const VARIANTS = {
  primary: { background: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none' },
  danger:  { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
  ghost:   { background: 'transparent', color: '#6ee7b7', border: '1px solid #1e3a2a' },
  save:    { background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: '#fff', border: 'none' },
  warn:    { background: 'rgba(234,179,8,0.12)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.3)' },
};

export default function Btn({ children, variant = 'ghost', onClick, disabled, style = {}, size = 'md' }) {
  const v = VARIANTS[variant] || VARIANTS.ghost;
  const pad = size === 'sm' ? '5px 12px' : '8px 18px';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...v,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      borderRadius: 8, padding: pad,
      fontSize: 11, fontWeight: 700, letterSpacing: 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: "'DM Mono',monospace",
      transition: 'opacity 0.15s, transform 0.1s',
      whiteSpace: 'nowrap',
      ...style,
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? '0.5' : '1'; }}
    >
      {children}
    </button>
  );
}