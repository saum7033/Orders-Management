import React from 'react';

export default function SectionCard({ title, count, actions, children, className }) {
  return (
    <div className={className} style={{
      background: 'rgba(9,22,17,0.7)',
      border: '1px solid #1a3028',
      borderRadius: 14,
      padding: 24,
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#6ee7b7', textTransform: 'uppercase' }}>
            {title}
            {count !== undefined && (
              <span style={{ marginLeft: 8, fontSize: 10, color: '#4b7a60', fontWeight: 400 }}>
                ({count} rows)
              </span>
            )}
          </span>
        </div>
        {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}