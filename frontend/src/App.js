import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Navbar from './components/Navbar';
import EntryPage from './pages/EntryPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';

/* Module-level: stable reference, hooks work correctly */
function AccessDenied() {
  const nav = useNavigate();
  useEffect(() => {
    toast.error('Access denied — Admin only');
    nav('/entry', { replace: true });
  }, [nav]);
  return null;
}

export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    const stored = localStorage.getItem('jwt_user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (user) => setAuthUser(user);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_user');
    setAuthUser(null);
  };

  const PrivateRoute = ({ children }) => {
    if (!authUser) return <Navigate to="/login" replace />;
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!authUser) return <Navigate to="/login" replace />;
    if (authUser.role !== 'ADMIN') return <AccessDenied />;
    return children;
  };

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d2318', color: '#d1fae5',
            border: '1px solid #1e3a2a',
            fontFamily: "'DM Mono', monospace", fontSize: 12,
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#0d2318' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0d2318' } },
        }}
      />
      {authUser && <Navbar authUser={authUser} onLogout={handleLogout} />}
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/" element={<Navigate to={authUser ? "/entry" : "/login"} replace />} />
          <Route path="/entry"     element={<PrivateRoute><EntryPage authUser={authUser} /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/users"     element={<AdminRoute><UserManagementPage authUser={authUser} /></AdminRoute>} />
          <Route path="/settings"  element={<AdminRoute><SettingsPage authUser={authUser} /></AdminRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
