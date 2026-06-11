import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

const inputStyle = () => ({
  width: '100%', background: 'rgba(9,22,17,0.8)',
  border: '1px solid #1e3a2a',
  borderRadius: 8, padding: '10px 14px', color: '#d1fae5',
  fontSize: 13, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'DM Mono',monospace", transition: 'border-color 0.2s',
});

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error('Username and password are required');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('jwt_user', JSON.stringify({ username: data.username, role: data.role }));
      onLogin({ username: data.username, role: data.role });
      toast.success(`Welcome, ${data.username}!`);
      navigate('/entry');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#040a07',
    }}>
      <div style={{
        width: 400, background: 'rgba(9,22,17,0.95)',
        border: '1px solid #1a3028', borderRadius: 16, padding: 36,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e55' }} />
          <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 16, letterSpacing: 3, color: '#a7f3d0' }}>
            ORDERFLOW
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 5 }}>
              Username
            </label>
            <input
              value={username} onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handle()}
              placeholder="Enter username"
              style={inputStyle()}
              onFocus={(e) => (e.target.style.borderColor = '#059669')}
              onBlur={(e) => (e.target.style.borderColor = '#1e3a2a')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 5 }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handle()}
              placeholder="Enter password"
              style={inputStyle()}
              onFocus={(e) => (e.target.style.borderColor = '#059669')}
              onBlur={(e) => (e.target.style.borderColor = '#1e3a2a')}
            />
          </div>

          <button
            onClick={handle} disabled={loading}
            style={{
              marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: loading ? '#1e3a2a' : 'linear-gradient(135deg,#059669,#047857)',
              border: 'none', borderRadius: 8, padding: '12px 0', width: '100%',
              color: loading ? '#4b7a60' : '#fff',
              fontWeight: 700, fontSize: 13, letterSpacing: 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {loading ? '⏳ Please wait…' : <><LogIn size={14} /> SIGN IN</>}
          </button>
        </div>
      </div>
    </div>
  );
}
