'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type FormMode = 'login' | 'signup';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const switchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('me_token');
      if (token) router.push('/dashboard');
    }
  }, [router]);

  function saveUserLocally(email: string, password: string) {
    const users = JSON.parse(localStorage.getItem('me_users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      setError('User with this email already exists');
      return false;
    }
    users.push({ email, password });
    localStorage.setItem('me_users', JSON.stringify(users));
    return true;
  }

  function verifyUserLocally(email: string, password: string) {
    const users = JSON.parse(localStorage.getItem('me_users') || '[]');
    return users.find((u: any) => u.email === email && u.password === password);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    if (mode === 'signup') {
      if (saveUserLocally(email, password)) {
        localStorage.setItem('me_token', JSON.stringify({ email }));
        router.push('/dashboard');
      }
      return;
    }

    const user = verifyUserLocally(email, password);
    if (!user) {
      setError('Invalid credentials or user not found');
      return;
    }
    localStorage.setItem('me_token', JSON.stringify({ email }));
    router.push('/dashboard');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4f46e5, #9333ea, #ec4899)',
        padding: '16px',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '16px',
          padding: '3px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.8s ease-out',
        }}
      >
        <h1
          style={{
            fontSize: '30px',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '32px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          Mini Expense Tracker
        </h1>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div
            style={{
              //background: 'rgba(239, 68, 68, 0.2)',
              color: '#fecdd3',
              fontSize: '14px',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              animation: 'pulse 1.5s infinite',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            ref={emailInputRef}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '15px',
              outline: 'none',
              transition: 'border 0.3s ease, box-shadow 0.3s ease',
            }}
            onFocus={() => {
              if (emailInputRef.current) {
                emailInputRef.current.style.border = '1px solid #a5b4fc';
                emailInputRef.current.style.boxShadow = '0 0 8px rgba(165, 180, 252, 0.5)';
              }
            }}
            onBlur={() => {
              if (emailInputRef.current) {
                emailInputRef.current.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                emailInputRef.current.style.boxShadow = 'none';
              }
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            ref={passwordInputRef}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '15px',
              outline: 'none',
              transition: 'border 0.3s ease, box-shadow 0.3s ease',
            }}
            onFocus={() => {
              if (passwordInputRef.current) {
                passwordInputRef.current.style.border = '1px solid #a5b4fc';
                passwordInputRef.current.style.boxShadow = '0 0 8px rgba(165, 180, 252, 0.5)';
              }
            }}
            onBlur={() => {
              if (passwordInputRef.current) {
                passwordInputRef.current.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                passwordInputRef.current.style.boxShadow = 'none';
              }
            }}
          />
          <button
            type="submit"
            ref={submitButtonRef}
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(90deg, #4f46e5, #9333ea)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={() => {
              if (submitButtonRef.current) {
                submitButtonRef.current.style.transform = 'scale(1.05)';
                submitButtonRef.current.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.5)';
              }
            }}
            onMouseLeave={() => {
              if (submitButtonRef.current) {
                submitButtonRef.current.style.transform = 'scale(1)';
                submitButtonRef.current.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
              }
            }}
          >
            {mode === 'login' ? 'Login' : 'Signup'}
          </button>
          <button
            type="button"
            ref={switchButtonRef}
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{
              marginTop: '8px',
              background: 'transparent',
              border: 'none',
              color: '#e0e7ff',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'underline',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={() => {
              if (switchButtonRef.current) {
                switchButtonRef.current.style.color = '#ffffff';
              }
            }}
            onMouseLeave={() => {
              if (switchButtonRef.current) {
                switchButtonRef.current.style.color = '#e0e7ff';
              }
            }}
          >
            {mode === 'login'
              ? "Don't have an account? Signup"
              : 'Already have an account? Login'}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}