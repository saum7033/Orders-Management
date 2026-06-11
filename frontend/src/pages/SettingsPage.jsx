import React, { useState } from 'react';
import { Shield, User, Check, X, Save, RefreshCw, Settings, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';

const SETTINGS_KEY = 'app_settings';

const DEFAULTS = {
  requireEmailForNewUsers: false,
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULTS };
}

/* ─── Permissions matrix ─────────────────────────────────────────────────── */
const PERMISSIONS = [
  { category: 'Data Access',       feature: 'View Data Entry (Tables 1, 2, 3)',  admin: true,  user: true  },
  { category: 'Data Access',       feature: 'View Dashboard & Analytics',        admin: true,  user: true  },
  { category: 'Data Entry',        feature: 'Add records (manual entry)',         admin: true,  user: true  },
  { category: 'Data Entry',        feature: 'Upload Excel files',                admin: true,  user: true  },
  { category: 'Data Entry',        feature: 'Edit Status / Comments / Remark',   admin: true,  user: true  },
  { category: 'Data Entry',        feature: 'Edit any field in a record',        admin: true,  user: false },
  { category: 'Data Deletion',     feature: 'Delete individual records',         admin: true,  user: false },
  { category: 'Data Deletion',     feature: 'Clear all records in a table',      admin: true,  user: false },
  { category: 'User Management',   feature: 'View User Management page',         admin: true,  user: false },
  { category: 'User Management',   feature: 'Create new users',                  admin: true,  user: false },
  { category: 'User Management',   feature: 'Edit existing users',               admin: true,  user: false },
  { category: 'User Management',   feature: 'Activate / Deactivate users',       admin: true,  user: false },
  { category: 'User Management',   feature: 'Delete users',                      admin: true,  user: false },
  { category: 'System',            feature: 'View & change system settings',     admin: true,  user: false },
];

/* ─── Permission cell ────────────────────────────────────────────────────── */
function PermCell({ allowed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {allowed
        ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
            color: '#4ade80' }}>
            <Check size={11} strokeWidth={3} />
          </span>
        : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444' }}>
            <X size={11} strokeWidth={3} />
          </span>
      }
    </div>
  );
}

/* ─── Toggle switch ──────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: 42, height: 24, borderRadius: 12, cursor: 'pointer',
      background: checked ? '#059669' : '#1e3a2a',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      border: `1px solid ${checked ? '#059669' : '#2a4a38'}`,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: checked ? 21 : 2,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </div>
  );
}

/* ─── Section card ───────────────────────────────────────────────────────── */
function Card({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'rgba(9,22,17,0.6)', border: '1px solid #1a3028',
      borderRadius: 12, padding: 24, marginBottom: 24,
    }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#6ee7b7', letterSpacing: 0.5 }}>{title}</h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 10, color: '#2d4a3a', letterSpacing: 1.5 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/* ─── Setting row ────────────────────────────────────────────────────────── */
function SettingRow({ label, description, checked, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: '1px solid #0d1f18',
    }}>
      <div style={{ flex: 1, marginRight: 24 }}>
        <div style={{ fontSize: 12, color: '#d1fae5', fontWeight: 600, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 11, color: '#4b7a60', lineHeight: 1.5 }}>{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ─── Change Password card ───────────────────────────────────────────────── */
const pwdInput = (err) => ({
  width: '100%', background: '#0a1810',
  border: `1px solid ${err ? '#f87171' : '#1e3a2a'}`,
  borderRadius: 8, color: '#d1fae5', padding: '10px 13px', fontSize: 12,
  fontFamily: "'DM Mono',monospace", outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
});

function ChangePasswordCard() {
  const [form, setForm]       = useState({ current: '', next: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handle = async () => {
    if (!form.current || !form.next || !form.confirm) { setError('All fields are required'); return; }
    if (form.next.length < 6)  { setError('New password must be at least 6 characters'); return; }
    if (form.next !== form.confirm) { setError('New passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.changePassword(form.current, form.next);
      toast.success('Password changed successfully');
      setForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      setError(e.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'block', color: '#4b7a60', fontSize: 10,
    fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase',
  };

  return (
    <Card title="Change Password" subtitle="UPDATE YOUR ADMIN PASSWORD">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Lock size={13} style={{ color: '#4b7a60' }} />
        <span style={{ fontSize: 11, color: '#4b7a60' }}>Changes take effect immediately on next login.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Current Password</label>
          <input type="password" value={form.current} onChange={set('current')}
            placeholder="••••••••" style={pwdInput(!!error && !form.current)}
            onFocus={e => { e.target.style.borderColor = '#059669'; }}
            onBlur={e => { e.target.style.borderColor = error && !form.current ? '#f87171' : '#1e3a2a'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>New Password</label>
          <input type="password" value={form.next} onChange={set('next')}
            placeholder="••••••••" style={pwdInput(!!error && !form.next)}
            onFocus={e => { e.target.style.borderColor = '#059669'; }}
            onBlur={e => { e.target.style.borderColor = error && !form.next ? '#f87171' : '#1e3a2a'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Confirm New Password</label>
          <input type="password" value={form.confirm} onChange={set('confirm')}
            placeholder="••••••••" style={pwdInput(!!error && form.next !== form.confirm)}
            onFocus={e => { e.target.style.borderColor = '#059669'; }}
            onBlur={e => { e.target.style.borderColor = error && form.next !== form.confirm ? '#f87171' : '#1e3a2a'; }}
          />
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: 12, padding: '8px 12px', borderRadius: 8,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          color: '#f87171', fontSize: 11,
        }}>
          ⚠ {error}
        </div>
      )}

      <button onClick={handle} disabled={loading} style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: loading ? 'rgba(5,150,105,0.08)' : 'rgba(5,150,105,0.2)',
        border: '1px solid #059669', borderRadius: 8, color: '#6ee7b7',
        padding: '9px 20px', fontSize: 12, fontWeight: 700,
        cursor: loading ? 'wait' : 'pointer',
        fontFamily: "'DM Mono',monospace", letterSpacing: 1,
      }}>
        <Lock size={12} /> {loading ? 'SAVING…' : 'CHANGE PASSWORD'}
      </button>
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
export default function SettingsPage({ authUser }) {
  const [settings, setSettings] = useState(loadSettings);
  const [dirty, setDirty] = useState(false);

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setDirty(false);
    toast.success('Settings saved');
  };

  const handleReset = () => {
    setSettings({ ...DEFAULTS });
    setDirty(true);
  };

  /* Group permissions by category */
  const categories = [...new Set(PERMISSIONS.map(p => p.category))];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#ecfdf5', letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={22} style={{ color: '#6ee7b7' }} />
            System Settings
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 10, color: '#2d4a3a', letterSpacing: 2 }}>
            ADMIN CONTROLS &amp; PERMISSIONS
          </p>
        </div>

        {dirty && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleReset} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: '1px solid #1e3a2a',
              borderRadius: 8, color: '#4b7a60', padding: '9px 14px',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Mono',monospace",
            }}>
              <RefreshCw size={12} /> RESET TO DEFAULTS
            </button>
            <button onClick={handleSave} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(5,150,105,0.2)', border: '1px solid #059669',
              borderRadius: 8, color: '#6ee7b7', padding: '9px 18px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Mono',monospace", letterSpacing: 1,
            }}>
              <Save size={13} /> SAVE CHANGES
            </button>
          </div>
        )}
      </div>

      {/* ── System Preferences ── */}
      <Card title="System Preferences" subtitle="CONFIGURE APPLICATION BEHAVIOUR">
        <SettingRow
          label="Require Email for New Users"
          description="When enabled, admins must provide an email address when creating a user account in User Management."
          checked={settings.requireEmailForNewUsers}
          onChange={v => update('requireEmailForNewUsers', v)}
        />
        {!dirty && (
          <div style={{ paddingTop: 14, textAlign: 'right' }}>
            <span style={{ fontSize: 10, color: '#2d4a3a' }}>
              Changes are saved to this browser. Toggle a setting to save.
            </span>
          </div>
        )}
      </Card>

      {/* ── Role Permissions Matrix ── */}
      <Card title="Role Permissions" subtitle="WHAT EACH ROLE CAN DO">

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 18 }}>
          {[
            { role: 'ADMIN', icon: <Shield size={12} />, color: '#c4b5fd', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
            { role: 'USER',  icon: <User  size={12} />, color: '#6ee7b7', bg: 'rgba(5,150,105,0.12)',  border: 'rgba(5,150,105,0.25)' },
          ].map(({ role, icon, color, bg, border }) => (
            <span key={role} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: bg, color, border: `1px solid ${border}`,
              padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: 1,
            }}>
              {icon} {role}
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 8, fontSize: 11, color: '#4b7a60' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Check size={11} style={{ color: '#4ade80' }} /> Allowed</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><X size={11} style={{ color: '#ef4444' }} /> Not allowed</span>
          </span>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #1a3028', borderRadius: 10, overflow: 'hidden' }}>

          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 110px 110px',
            background: '#060f0b', borderBottom: '2px solid #1e3a2a', padding: '0 16px',
          }}>
            {['FEATURE', 'ADMIN', 'USER'].map(h => (
              <div key={h} style={{ padding: '10px 8px', color: '#4b7a60', fontSize: 10, fontWeight: 700, letterSpacing: 1, textAlign: h === 'FEATURE' ? 'left' : 'center' }}>
                {h}
              </div>
            ))}
          </div>

          {categories.map(cat => (
            <React.Fragment key={cat}>
              {/* Category separator */}
              <div style={{
                padding: '6px 24px', background: 'rgba(5,150,105,0.04)',
                borderBottom: '1px solid #0d1a13',
                fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#2d4a3a', textTransform: 'uppercase',
              }}>
                {cat}
              </div>

              {PERMISSIONS.filter(p => p.category === cat).map((p, i, arr) => (
                <div key={p.feature} style={{
                  display: 'grid', gridTemplateColumns: '1fr 110px 110px',
                  padding: '0 16px',
                  background: i % 2 === 0 ? 'rgba(9,22,17,0.5)' : 'rgba(6,15,10,0.4)',
                  borderBottom: i === arr.length - 1 ? '1px solid #111e16' : '1px solid #0a1a13',
                }}>
                  <div style={{ padding: '11px 8px', fontSize: 12, color: '#a7f3d0' }}>
                    {p.feature}
                  </div>
                  <div style={{ padding: '11px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PermCell allowed={p.admin} />
                  </div>
                  <div style={{ padding: '11px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PermCell allowed={p.user} />
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        <p style={{ margin: '14px 0 0', fontSize: 10, color: '#2d4a3a', lineHeight: 1.6 }}>
          Permissions are enforced both in the UI and at the API level via Spring Security.
          Role assignments are managed in the <strong style={{ color: '#4b7a60' }}>User Management</strong> page.
        </p>
      </Card>

      {/* ── Change Password ── */}
      <ChangePasswordCard />

      {/* ── Session info ── */}
      <Card title="Session & Security" subtitle="READ-ONLY — CONFIGURED IN BACKEND">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
          {[
            { label: 'Authentication',  value: 'JWT (Bearer Token)' },
            { label: 'Session Storage', value: 'localStorage' },
            { label: 'Token Expiry',    value: '24 hours' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(9,22,17,0.6)', border: '1px solid #1a3028',
              borderRadius: 8, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 9, color: '#2d4a3a', letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 12, color: '#6ee7b7', fontFamily: "'DM Mono',monospace" }}>{value}</div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
