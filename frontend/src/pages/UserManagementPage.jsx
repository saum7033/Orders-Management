import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Pencil, Trash2, Power, Search, X,
  Shield, User, RefreshCw, ChevronDown, ChevronUp, ClipboardList,
  AlertTriangle, Terminal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi, auditLogsApi, healthApi, isHtmlError } from '../services/api';

/* ─── Role badge ─────────────────────────────────────────────────────────── */
function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: isAdmin ? 'rgba(139,92,246,0.15)' : 'rgba(5,150,105,0.12)',
      color: isAdmin ? '#c4b5fd' : '#6ee7b7',
      border: `1px solid ${isAdmin ? 'rgba(139,92,246,0.3)' : 'rgba(5,150,105,0.25)'}`,
      padding: '2px 9px', borderRadius: 12, fontSize: 10, fontWeight: 700, letterSpacing: 1,
      whiteSpace: 'nowrap',
    }}>
      {isAdmin ? <Shield size={9} /> : <User size={9} />} {role}
    </span>
  );
}

/* ─── Status badge ───────────────────────────────────────────────────────── */
function ActiveBadge({ active }) {
  return (
    <span style={{
      display: 'inline-block',
      background: active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)',
      color: active ? '#6ee7b7' : '#f87171',
      border: `1px solid ${active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
      padding: '2px 9px', borderRadius: 12, fontSize: 10, fontWeight: 700, letterSpacing: 1,
    }}>
      {active ? '● Active' : '○ Inactive'}
    </span>
  );
}

/* ─── Field ──────────────────────────────────────────────────────────────── */
function Field({ label, value, onChange, type = 'text', placeholder, error, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', color: '#4b7a60', fontSize: 10,
        fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
        style={{
          width: '100%', background: '#0a1810',
          border: `1px solid ${error ? '#f87171' : '#1e3a2a'}`,
          borderRadius: 8, color: '#d1fae5', padding: '10px 13px', fontSize: 12,
          fontFamily: "'DM Mono',monospace", outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = error ? '#f87171' : '#059669'; }}
        onBlur={e => { e.currentTarget.style.borderColor = error ? '#f87171' : '#1e3a2a'; }}
      />
      {error && <div style={{ color: '#f87171', fontSize: 10, marginTop: 4 }}>{error}</div>}
      {hint && !error && <div style={{ color: '#2d4a3a', fontSize: 10, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

/* ─── Toggle switch ──────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 38, height: 22, borderRadius: 11,
        background: checked ? '#059669' : '#1e3a2a',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3,
          left: checked ? 19 : 3,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </div>
      <span style={{ color: checked ? '#6ee7b7' : '#4b7a60', fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
        {label}
      </span>
    </label>
  );
}

/* ─── User form modal ────────────────────────────────────────────────────── */
function UserModal({ user, onSave, onClose }) {
  const isEdit = !!user?.id;

  const [form, setForm] = useState({
    username: user?.username || '',
    password: '',
    role:     user?.role     || 'USER',
    email:    user?.email    || '',
    active:   user?.active   !== undefined ? user.active : true,
  });
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  const set = (key) => (val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
    setSaveError('');
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim())              e.username = 'Username is required';
    if (!isEdit && !form.password.trim())   e.password = 'Password is required for new users';
    if (form.password && form.password.length < 6)
                                            e.password = 'Minimum 6 characters';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    setSaveError('');
    try {
      await onSave({ ...form, id: user?.id });
      // If onSave resolves, the parent closes the modal — nothing to do here
    } catch (err) {
      setSaveError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, backdropFilter: 'blur(5px)',
      }}>
      <div style={{
        background: '#060f0b', border: '1px solid #1e3a2a', borderRadius: 14,
        padding: 32, width: 460, maxWidth: '92vw',
        boxShadow: '0 28px 72px rgba(0,0,0,0.85)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#6ee7b7', letterSpacing: -0.5 }}>
            {isEdit ? '✏️ Edit User' : '➕ Create User'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b7a60', padding: 4, display: 'flex', borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        <Field
          label="Username"
          value={form.username}
          onChange={set('username')}
          placeholder="e.g. john_doe"
          error={errors.username}
        />
        <Field
          label={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
          value={form.password}
          onChange={set('password')}
          type="password"
          placeholder="••••••••"
          error={errors.password}
          hint={isEdit ? 'Leave blank to keep the current password' : undefined}
        />
        <Field
          label="Email (optional)"
          value={form.email}
          onChange={set('email')}
          type="email"
          placeholder="user@example.com"
        />

        {/* Role — fixed to USER for all admin-created accounts */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', color: '#4b7a60', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
            Role
          </label>
          <div style={{
            width: '100%', background: '#060f0b', border: '1px solid #1e3a2a',
            borderRadius: 8, padding: '10px 13px', fontSize: 12,
            fontFamily: "'DM Mono',monospace", color: '#6ee7b7',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <User size={12} /> USER — can view and enter data
          </div>
        </div>

        {/* Active toggle (edit only) */}
        {isEdit && (
          <div style={{ marginBottom: 24, padding: '12px 14px', background: 'rgba(9,22,17,0.6)', borderRadius: 8, border: '1px solid #1a3028' }}>
            <Toggle
              checked={form.active}
              onChange={v => setForm(f => ({ ...f, active: v }))}
              label={form.active ? 'Account Active' : 'Account Inactive'}
            />
          </div>
        )}

        {/* Inline save error */}
        {saveError && (
          <div style={{
            marginBottom: 14, padding: '10px 13px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171', fontSize: 11, lineHeight: 1.5,
          }}>
            ⚠ {saveError}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, background: 'transparent', border: '1px solid #1e3a2a',
            borderRadius: 8, color: '#4b7a60', padding: '11px 0',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'DM Mono',monospace", letterSpacing: 1,
          }}>
            CANCEL
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{
            flex: 2,
            background: saving ? 'rgba(5,150,105,0.1)' : saveError ? 'rgba(239,68,68,0.12)' : 'rgba(5,150,105,0.2)',
            border: `1px solid ${saveError ? 'rgba(239,68,68,0.4)' : '#059669'}`,
            borderRadius: 8, color: saveError ? '#f87171' : '#6ee7b7', padding: '11px 0',
            fontSize: 12, fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
            fontFamily: "'DM Mono',monospace", letterSpacing: 1,
            transition: 'all 0.2s',
          }}>
            {saving ? 'SAVING…' : isEdit ? 'SAVE CHANGES' : 'CREATE USER'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(9,22,17,0.6)', border: '1px solid #1a3028',
      borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 100,
    }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#4b7a60', letterSpacing: 1, marginTop: 5, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
export default function UserManagementPage({ authUser }) {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadError,    setLoadError]    = useState('');
  const [errorKind,    setErrorKind]    = useState(''); // 'rebuild' | '403' | 'other'
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modal,        setModal]        = useState(null); // null | { user: obj|null }
  const [auditLogs,    setAuditLogs]    = useState([]);
  const [showAudit,    setShowAudit]    = useState(false);
  const [backendVersion, setBackendVersion] = useState(null);

  /* ── load ─────────────────────────────────────────────────────────────── */
  // Check backend version once on mount to detect if old code is running
  useEffect(() => {
    healthApi.check().then(data => setBackendVersion(data?.version ?? 'unknown'));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    setErrorKind('');
    try {
      const [userList, logs] = await Promise.all([
        usersApi.getAll(),
        auditLogsApi.getAll().catch(() => []),
      ]);
      setUsers(userList);
      setAuditLogs(logs);
    } catch (e) {
      if (isHtmlError(e)) {
        setErrorKind('rebuild');
        setLoadError('Backend returned an HTML error page instead of JSON. The backend is running old compiled code that does not include the latest security configuration.');
      } else if (e.message?.includes('403')) {
        setErrorKind('403');
        setLoadError(e.message);
      } else {
        setErrorKind('other');
        setLoadError(e.message || 'Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── filter ───────────────────────────────────────────────────────────── */
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    if (q && !u.username.toLowerCase().includes(q) &&
             !(u.email || '').toLowerCase().includes(q)) return false;
    if (roleFilter   !== 'ALL' && u.role    !== roleFilter) return false;
    if (statusFilter === 'ACTIVE'   && !u.active)  return false;
    if (statusFilter === 'INACTIVE' &&  u.active)  return false;
    return true;
  });

  /* ── handlers ─────────────────────────────────────────────────────────── */
  const handleSave = async (formData) => {
    // Throws on error — UserModal catches it and shows inline error
    if (formData.id) {
      await usersApi.update(formData.id, formData);
      toast.success(`User "${formData.username}" updated`);
    } else {
      await usersApi.createOne(formData);
      toast.success(`User "${formData.username}" created`);
    }
    setModal(null);
    await load();
  };

  const handleToggle = async (user) => {
    try {
      await usersApi.toggleActive(user.id);
      toast.success(`"${user.username}" ${user.active ? 'deactivated' : 'activated'}`);
      await load();
    } catch (e) {
      toast.error(e.message || 'Failed to update status');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.username}"?\n\nThis cannot be undone.`)) return;
    try {
      await usersApi.deleteOne(user.id);
      toast.success(`User "${user.username}" deleted`);
      await load();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  /* ── stats ────────────────────────────────────────────────────────────── */
  const total    = users.length;
  const admins   = users.filter(u => u.role === 'ADMIN').length;
  const active   = users.filter(u => u.active).length;
  const inactive = total - active;

  /* ── icon btn helper ──────────────────────────────────────────────────── */
  const IconBtn = ({ onClick, title, disabled, color, bg, border, children }) => (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      style={{
        background: bg, border: `1px solid ${border}`,
        borderRadius: 6, padding: '5px 8px', cursor: disabled ? 'not-allowed' : 'pointer',
        color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.35 : 1, transition: 'opacity 0.15s',
      }}>
      {children}
    </button>
  );

  /* ── render ───────────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#ecfdf5', letterSpacing: -1 }}>
            User Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 10, color: '#2d4a3a', letterSpacing: 2 }}>
            MANAGE ACCESS &amp; PERMISSIONS
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #1e3a2a', borderRadius: 8, color: '#4b7a60', padding: '9px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Mono',monospace" }}>
            <RefreshCw size={12} style={loading ? { animation: 'spin 0.8s linear infinite' } : {}} />
            REFRESH
          </button>
          <button onClick={() => setModal({ user: null })}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(5,150,105,0.2)', border: '1px solid #059669', borderRadius: 8, color: '#6ee7b7', padding: '9px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>
            <UserPlus size={13} /> ADD USER
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Total Users" value={total}    color="#6ee7b7" />
        <StatCard label="Admins"      value={admins}   color="#c4b5fd" />
        <StatCard label="Active"      value={active}   color="#4ade80" />
        <StatCard label="Inactive"    value={inactive} color="#f87171" />
      </div>

      {/* ── Error banner (three states: rebuild / stale-token / generic) ── */}
      {loadError && errorKind === 'rebuild' && (
        <div style={{ marginBottom: 20, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(251,146,60,0.4)' }}>
          <div style={{ background: 'rgba(251,146,60,0.18)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={14} style={{ color: '#fb923c', flexShrink: 0 }} />
            <span style={{ color: '#fb923c', fontWeight: 800, fontSize: 12, letterSpacing: 0.5 }}>
              BACKEND NEEDS REBUILD — OLD CODE IS RUNNING
            </span>
          </div>
          <div style={{ background: 'rgba(251,146,60,0.05)', padding: '16px 16px 14px' }}>
            <p style={{ margin: '0 0 12px', color: '#9ca3af', fontSize: 11, lineHeight: 1.7 }}>
              The backend is returning HTML error pages instead of JSON. This means the latest security
              configuration has <strong style={{ color: '#fb923c' }}>not been compiled or loaded</strong>.
              You must stop the backend and rebuild it.
            </p>
            <div style={{
              background: '#020c06', border: '1px solid #1a3028', borderRadius: 8,
              padding: '12px 14px', marginBottom: 12, fontFamily: "'DM Mono',monospace",
              fontSize: 11, color: '#6ee7b7', lineHeight: 1.8,
            }}>
              <div style={{ color: '#4b7a60', fontSize: 10, marginBottom: 6, letterSpacing: 1 }}>STEP 1 — Stop the backend (Ctrl+C in its terminal), then run:</div>
              <div>cd Orders-Management/backend</div>
              <div style={{ color: '#4ade80' }}>mvn clean package -DskipTests &amp;&amp; mvn spring-boot:run</div>
              <div style={{ color: '#4b7a60', fontSize: 10, marginTop: 8 }}>STEP 2 — Watch for this in the logs (confirms new code is live):</div>
              <div style={{ color: '#c4b5fd' }}>Started OrderFlowApplication  <span style={{ color: '#4b7a60' }}>← then refresh this page</span></div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#4b7a60' }}>
                Backend version detected:{' '}
                <strong style={{ color: backendVersion === '2.0-rbac' ? '#4ade80' : '#f87171', fontFamily: "'DM Mono',monospace" }}>
                  {backendVersion ?? 'checking…'}
                </strong>
                {backendVersion === '2.0-rbac' ? ' ✓ new code' : ' ✗ needs rebuild'}
              </span>
              <button onClick={load} style={{
                background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.4)',
                borderRadius: 7, color: '#fb923c', padding: '6px 14px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Mono',monospace",
              }}>
                RETRY
              </button>
            </div>
          </div>
        </div>
      )}

      {loadError && errorKind === '403' && (
        <div style={{ marginBottom: 20, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(239,68,68,0.35)' }}>
          <div style={{ background: 'rgba(239,68,68,0.18)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
            <span style={{ color: '#f87171', fontWeight: 800, fontSize: 12, letterSpacing: 0.5 }}>
              ACCESS DENIED — LOG OUT AND BACK IN AS ADMIN
            </span>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.05)', padding: '14px 16px' }}>
            <p style={{ margin: '0 0 12px', color: '#9ca3af', fontSize: 11, lineHeight: 1.6 }}>
              The server rejected your session. Your token may be stale or your account may not have Admin role.
              Log out to get a fresh token.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => { localStorage.removeItem('jwt_token'); localStorage.removeItem('jwt_user'); window.location.href = '/login'; }}
                style={{
                  background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)',
                  borderRadius: 7, color: '#f87171', padding: '8px 16px',
                  fontSize: 11, fontWeight: 800, cursor: 'pointer',
                  fontFamily: "'DM Mono',monospace", letterSpacing: 1,
                }}>
                LOGOUT &amp; RE-LOGIN
              </button>
              <span style={{ fontSize: 10, color: '#4b7a60', lineHeight: 1.5 }}>
                Log out and sign back in with the admin account.
              </span>
            </div>
          </div>
        </div>
      )}

      {loadError && errorKind === 'other' && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.05)' }}>
          <span style={{ color: '#f87171', fontSize: 12, fontWeight: 700 }}>Could not load users: </span>
          <span style={{ color: '#9ca3af', fontSize: 11 }}>{loadError}</span>
          <button onClick={load} style={{ marginLeft: 12, background: 'none', border: '1px solid #1e3a2a', borderRadius: 6, color: '#4b7a60', padding: '3px 10px', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Mono',monospace" }}>RETRY</button>
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b7a60', pointerEvents: 'none' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by username or email…"
            style={{ width: '100%', background: '#0a1810', border: '1px solid #1e3a2a', borderRadius: 8, color: '#d1fae5', padding: '8px 10px 8px 32px', fontSize: 12, fontFamily: "'DM Mono',monospace", outline: 'none', boxSizing: 'border-box' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4b7a60', padding: 0, display: 'flex' }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Role filter pills */}
        {[['ALL', 'ALL ROLES'], ['ADMIN', 'ADMIN'], ['USER', 'USER']].map(([val, label]) => (
          <button key={val} onClick={() => setRoleFilter(val)} style={{
            background: roleFilter === val ? 'rgba(139,92,246,0.15)' : 'transparent',
            border: `1px solid ${roleFilter === val ? 'rgba(139,92,246,0.4)' : '#1e3a2a'}`,
            borderRadius: 8, color: roleFilter === val ? '#c4b5fd' : '#4b7a60',
            padding: '8px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'DM Mono',monospace", letterSpacing: 1,
          }}>{label}</button>
        ))}

        {/* Status filter pills */}
        {[['ALL', 'ALL STATUS'], ['ACTIVE', 'ACTIVE'], ['INACTIVE', 'INACTIVE']].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)} style={{
            background: statusFilter === val ? 'rgba(5,150,105,0.15)' : 'transparent',
            border: `1px solid ${statusFilter === val ? '#059669' : '#1e3a2a'}`,
            borderRadius: 8, color: statusFilter === val ? '#6ee7b7' : '#4b7a60',
            padding: '8px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'DM Mono',monospace", letterSpacing: 1,
          }}>{label}</button>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ border: '1px solid #1a3028', borderRadius: 12, overflow: 'hidden' }}>

        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '44px 1fr 110px 100px 200px 130px 116px',
          background: '#060f0b', borderBottom: '2px solid #1e3a2a',
          padding: '0 12px',
        }}>
          {['#', 'USERNAME', 'ROLE', 'STATUS', 'EMAIL', 'CREATED', 'ACTIONS'].map(h => (
            <div key={h} style={{ padding: '11px 8px', color: '#4b7a60', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
              {h}
            </div>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#4b7a60', fontSize: 12 }}>Loading users…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#2d4a3a', fontSize: 12, fontStyle: 'italic' }}>No users found</div>
        ) : filtered.map((u, i) => {
          const isSelf   = u.username === authUser?.username;
          const evenBg   = 'rgba(9,22,17,0.5)';
          const oddBg    = 'rgba(6,15,10,0.4)';
          const selfBg   = 'rgba(5,150,105,0.06)';
          const rowBg    = isSelf ? selfBg : i % 2 === 0 ? evenBg : oddBg;

          return (
            <div
              key={u.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr 110px 100px 200px 130px 116px',
                padding: '0 12px',
                background: rowBg,
                borderBottom: '1px solid #0a1a13',
                borderLeft: `3px solid ${isSelf ? '#059669' : 'transparent'}`,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(9,22,17,0.9)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
            >
              <div style={{ padding: '14px 8px', color: '#2d4a3a', fontSize: 11 }}>{i + 1}</div>

              {/* Username */}
              <div style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: u.role === 'ADMIN' ? 'rgba(139,92,246,0.18)' : 'rgba(5,150,105,0.15)',
                  border: `1px solid ${u.role === 'ADMIN' ? 'rgba(139,92,246,0.3)' : 'rgba(5,150,105,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: u.role === 'ADMIN' ? '#c4b5fd' : '#6ee7b7', fontSize: 11, fontWeight: 700,
                }}>
                  {u.username[0].toUpperCase()}
                </div>
                <span style={{ color: '#d1fae5', fontSize: 12, fontFamily: "'DM Mono',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.username}
                </span>
                {isSelf && (
                  <span style={{ fontSize: 9, color: '#059669', background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: 8, padding: '1px 6px', flexShrink: 0, letterSpacing: 1, fontWeight: 700 }}>
                    YOU
                  </span>
                )}
              </div>

              {/* Role */}
              <div style={{ padding: '14px 8px', display: 'flex', alignItems: 'center' }}>
                <RoleBadge role={u.role} />
              </div>

              {/* Status */}
              <div style={{ padding: '14px 8px', display: 'flex', alignItems: 'center' }}>
                <ActiveBadge active={u.active} />
              </div>

              {/* Email */}
              <div style={{ padding: '14px 8px', color: u.email ? '#6ee7b7' : '#2d4a3a', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {u.email || '—'}
              </div>

              {/* Created */}
              <div style={{ padding: '14px 8px', color: '#4b7a60', fontSize: 11 }}>
                {u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
                  : '—'}
              </div>

              {/* Actions */}
              <div style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <IconBtn
                  onClick={() => setModal({ user: u })}
                  title="Edit user"
                  color="#93c5fd" bg="rgba(59,130,246,0.1)" border="rgba(59,130,246,0.3)">
                  <Pencil size={12} />
                </IconBtn>

                <IconBtn
                  onClick={() => handleToggle(u)}
                  disabled={isSelf}
                  title={isSelf ? "Can't deactivate your own account" : u.active ? 'Deactivate' : 'Activate'}
                  color={u.active ? '#f87171' : '#6ee7b7'}
                  bg={u.active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.1)'}
                  border={u.active ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}>
                  <Power size={12} />
                </IconBtn>

                <IconBtn
                  onClick={() => handleDelete(u)}
                  disabled={isSelf}
                  title={isSelf ? "Can't delete your own account" : 'Delete user'}
                  color="#f87171" bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.25)">
                  <Trash2 size={12} />
                </IconBtn>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer count */}
      <div style={{ marginTop: 10, fontSize: 11, color: '#2d4a3a', textAlign: 'right' }}>
        {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
      </div>

      {/* ── Audit Log ── */}
      <div style={{ marginTop: 28, border: '1px solid #1a3028', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <button
          onClick={() => setShowAudit(v => !v)}
          style={{
            width: '100%', background: '#060f0b', border: 'none', cursor: 'pointer',
            padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: showAudit ? '1px solid #1a3028' : 'none',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={13} style={{ color: '#4b7a60' }} />
            <span style={{ color: '#4b7a60', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Mono',monospace" }}>
              AUDIT LOG
            </span>
            <span style={{
              fontSize: 10, color: '#059669', background: 'rgba(5,150,105,0.15)',
              border: '1px solid rgba(5,150,105,0.3)', borderRadius: 8,
              padding: '1px 7px', fontFamily: "'DM Mono',monospace",
            }}>
              {auditLogs.length}
            </span>
          </div>
          {showAudit ? <ChevronUp size={13} style={{ color: '#4b7a60' }} /> : <ChevronDown size={13} style={{ color: '#4b7a60' }} />}
        </button>

        {showAudit && (
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {auditLogs.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#2d4a3a', fontSize: 12, fontStyle: 'italic' }}>
                No audit events yet
              </div>
            ) : (
              <>
                {/* Table header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '160px 180px 1fr 1fr 1fr',
                  background: 'rgba(6,15,10,0.8)', borderBottom: '1px solid #1a3028', padding: '0 12px',
                }}>
                  {['TIMESTAMP', 'ACTION', 'PERFORMED BY', 'TARGET USER', 'DETAILS'].map(h => (
                    <div key={h} style={{ padding: '9px 8px', color: '#2d4a3a', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{h}</div>
                  ))}
                </div>
                {auditLogs.map((log, i) => {
                  const actionColors = {
                    USER_CREATED:     { color: '#4ade80',  bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)'  },
                    USER_UPDATED:     { color: '#93c5fd',  bg: 'rgba(147,197,253,0.1)', border: 'rgba(147,197,253,0.25)' },
                    USER_DELETED:     { color: '#f87171',  bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
                    USER_ACTIVATED:   { color: '#6ee7b7',  bg: 'rgba(110,231,183,0.1)', border: 'rgba(110,231,183,0.25)' },
                    USER_DEACTIVATED: { color: '#fb923c',  bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)'  },
                  };
                  const ac = actionColors[log.action] || { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)' };
                  const ts = log.timestamp
                    ? new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—';
                  return (
                    <div
                      key={log.id || i}
                      style={{
                        display: 'grid', gridTemplateColumns: '160px 180px 1fr 1fr 1fr',
                        padding: '0 12px', borderBottom: '1px solid #0a1a13',
                        background: i % 2 === 0 ? 'rgba(9,22,17,0.4)' : 'transparent',
                      }}>
                      <div style={{ padding: '11px 8px', color: '#4b7a60', fontSize: 11 }}>{ts}</div>
                      <div style={{ padding: '9px 8px', display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                          color: ac.color, background: ac.bg, border: `1px solid ${ac.border}`,
                          borderRadius: 6, padding: '2px 8px', fontFamily: "'DM Mono',monospace",
                        }}>
                          {log.action.replace('USER_', '')}
                        </span>
                      </div>
                      <div style={{ padding: '11px 8px', color: '#d1fae5', fontSize: 11, fontFamily: "'DM Mono',monospace" }}>{log.performedBy}</div>
                      <div style={{ padding: '11px 8px', color: '#6ee7b7', fontSize: 11, fontFamily: "'DM Mono',monospace" }}>{log.targetUser}</div>
                      <div style={{ padding: '11px 8px', color: '#4b7a60', fontSize: 11 }}>{log.details || '—'}</div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal !== null && (
        <UserModal
          user={modal.user}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
