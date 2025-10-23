'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignupMessage, setShowSignupMessage] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('me_token');
      if (token) router.push('/dashboard');
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    // Only allow specific Gmail account
    const allowedEmail = 'bahadurshigri@gmail.com';
    const allowedPassword = '123456';

    if (email !== allowedEmail || password !== allowedPassword) {
      setError('Invalid email or password');
      return;
    }

    // Login successful
    localStorage.setItem('me_token', JSON.stringify({ email }));
    router.push('/dashboard');
  }

  function handleSignupClick() {
    setShowSignupMessage(true);
    setTimeout(() => {
      setShowSignupMessage(false);
    }, 3000);
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
          padding: '32px',
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
            marginBottom: '8px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          Mini Expense Tracker
        </h1>
        
        <p
          style={{
            fontSize: '14px',
            color: '#e0e7ff',
            textAlign: 'center',
            marginBottom: '32px',
            opacity: 0.9,
          }}
        >
          Personal Expense Management System
        </p>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          Login to Continue
        </h2>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fecdd3',
              fontSize: '14px',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              animation: 'pulse 1.5s infinite',
              textAlign: 'center',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            {error}
          </div>
        )}

        {showSignupMessage && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fed7aa',
              fontSize: '14px',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              animation: 'slideIn 0.3s ease-out',
              textAlign: 'center',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            ⚠️ Signup is not allowed. Please ! contact admin if u are new user .
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
          <div>
            <input
              type="email"
              placeholder="Enter your email"
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
                width: '100%',
                boxSizing: 'border-box',
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
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Enter your password"
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
                width: '100%',
                boxSizing: 'border-box',
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
          </div>
          
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
              width: '100%',
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
            Login
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={handleSignupClick}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e0e7ff',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'underline',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                opacity: 0.8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e7ff';
                e.currentTarget.style.opacity = '0.8';
              }}
            >
              Don't have an account? Signup
            </button>
          </div>
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
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
}