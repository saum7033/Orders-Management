import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar({ authUser, onLogout }) {
  const { pathname } = useLocation();
  const nav = [
    { to: '/entry',     icon: <Database size={14} />,        label: 'Data Entry' },
    { to: '/dashboard', icon: <LayoutDashboard size={14} />, label: 'Dashboard' },
  ];
  return (
    <nav style={{
      background: 'rgba(4,10,7,0.97)',
      borderBottom: '1px solid #0d2318',
      padding: '0 32px',
      height: 54,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e55' }} />
        <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 14, letterSpacing: 3, color: '#a7f3d0' }}>
          ORDERFLOW
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {nav.map(item => {
          const active = pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 7,
              background: active ? 'rgba(16,185,129,0.15)' : 'transparent',
              border: `1px solid ${active ? '#065f46' : 'transparent'}`,
              color: active ? '#6ee7b7' : '#4b7a60',
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
              textDecoration: 'none', transition: 'all 0.2s',
            }}>
              {item.icon} {item.label.toUpperCase()}
            </Link>
          );
        })}

        {/* Role badge */}
        {authUser && (
          <span style={{
            marginLeft: 8, padding: '3px 10px', borderRadius: 12,
            background: authUser.role === 'ADMIN' ? 'rgba(139,92,246,0.15)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${authUser.role === 'ADMIN' ? 'rgba(139,92,246,0.3)' : 'rgba(34,197,94,0.25)'}`,
            color: authUser.role === 'ADMIN' ? '#c4b5fd' : '#6ee7b7',
            fontSize: 10, fontWeight: 700, letterSpacing: 1,
          }}>
            {authUser.role === 'ADMIN' ? '🛠 ' : '👤 '}{authUser.username}
          </span>
        )}

        <button onClick={onLogout} style={{
          marginLeft: 4, display: 'flex', alignItems: 'center', gap: 5,
          background: 'transparent', border: '1px solid #1e3a2a',
          borderRadius: 7, padding: '6px 12px', color: '#4b7a60',
          fontSize: 11, fontWeight: 700, cursor: 'pointer',
          fontFamily: "'DM Mono',monospace", letterSpacing: 1,
        }}>
          <LogOut size={12} /> LOGOUT
        </button>
      </div>
    </nav>
  );
}
