'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Login page (client)
 * - Default demo password = "1234" (if none stored)
 * - Successful login sets sessionStorage 'expense-auth' = '1'
 * - Password is stored in localStorage key 'expense-auth-password' (for demo only)
 */

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [storedPwd, setStoredPwd] = useState<string | null>(null);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const p = localStorage.getItem('expense-auth-password');
    setStoredPwd(p); // if null -> default is '1234'
  }, []);

  const login = () => {
    const actual = storedPwd ?? '1234';
    if (password === actual) {
      sessionStorage.setItem('expense-auth', '1');
      setMessage('✅ Login successful. Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } else {
      setMessage('❌ Wrong password. Try again.');
    }
  };

  const logoutAnywhere = () => {
    sessionStorage.removeItem('expense-auth');
    setMessage('Logged out.');
  };

  const changePassword = () => {
    if (!newPwd) return setMessage('⚠️ Enter a new password.');
    if (newPwd !== confirmPwd) return setMessage('⚠️ Passwords do not match.');
    localStorage.setItem('expense-auth-password', newPwd);
    setStoredPwd(newPwd);
    setNewPwd('');
    setConfirmPwd('');
    setMessage('✅ Password updated.');
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'linear-gradient(135deg,#f8fafc 0%,#e6f0ff 100%)'
    }}>
      <div style={{
        width: 420, maxWidth: '95%', background: 'white', padding: 22,
        borderRadius: 10, boxShadow: '0 10px 30px rgba(2,6,23,0.06)'
      }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>🔐 Login</h2>
        <p style={{ color: '#475569', marginTop: 8 }}>
          Use your password to access the dashboard. (Default demo password: <strong>1234</strong>)
        </p>

        <div style={{ marginTop: 14 }}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef8' }}
          />
          <button
            onClick={login}
            style={{
              marginTop: 10, width: '100%', padding: '10px 12px', borderRadius: 8,
              background: 'linear-gradient(90deg,#2563eb,#3b82f6)', color: 'white', border: 'none', fontWeight: 700
            }}
          >
            Login
          </button>
        </div>

        {message && <div style={{ marginTop: 12, color: '#0369a1' }}>{message}</div>}

        <hr style={{ margin: '18px 0', borderColor: '#eef2ff' }} />

        <h3 style={{ margin: 0, color: '#0f172a' }}>⚙️ Change Password</h3>
        <p style={{ color: '#475569', marginTop: 6 }}>Set a new password (stored locally in browser).</p>

        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          <input
            type="password"
            placeholder="New password"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef8' }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPwd}
            onChange={e => setConfirmPwd(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef8' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={changePassword} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: '#10b981', color: 'white', border: 'none' }}>
              Save Password
            </button>
            <button onClick={logoutAnywhere} style={{ padding: '8px 10px', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none' }}>
              Logout (clear session)
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>
          <div>Stored password: <strong style={{ color: '#111827' }}>{storedPwd ? 'custom set' : 'default (1234)'}</strong></div>
        </div>
      </div>
    </div>
  );
}
