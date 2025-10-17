// app/layout.tsx
import './globals.css';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'My Expense Tracker',
  description: 'Small LocalStorage-based expense tracker — Daily & monthly expense manager',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', minHeight: '50vh', flexDirection: 'column', background: '#f7fafc' }}>
        {/* HEADER */}
        <header
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e6e9ee',
            padding: '18px 24px',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.02)',
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            {/* Left: Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ margin: 0, fontSize: 20, letterSpacing: 0.2 }}>💸 My Expense Tracker</h1>
                <span
                  style={{
                    background: '#eef2ff',
                    color: '#3730a3',
                    padding: '4px 8px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  LocalStorage Demo
                </span>
              </div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Simple • Fast • Shared household expense manager</div>
            </div>

            {/* Center: Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  background: 'linear-gradient(180deg,#ffffff,#fbfbff)',
                  boxShadow: '0 8px 28px rgba(99,102,241,0.08)',
                }}
              >
                {/* Place a file `public/logo.png` (or .svg) in your project */}
                <Image src="/logoo.png" alt="logo" width={72} height={72} style={{ objectFit: 'contain', borderRadius: 8 }} />
              </div>
            </div>

            {/* Right: Nav & Login */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <nav style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 15 }}>
                <Link href="/dashboard" style={{ color: '#111827', textDecoration: 'none' }}>
                  Dashboard
                </Link>
                <Link href="/expenses" style={{ color: '#111827', textDecoration: 'none' }}>
                  Expenses
                </Link>
                <Link href="/people" style={{ color: '#111827', textDecoration: 'none' }}>
                  People
                </Link>
                <Link href="/attendance" style={{ color: '#111827', textDecoration: 'none' }}>
                  Attendance
                </Link>
              </nav>

              <div>
                <Link
                  href="/login"
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 6px 16px rgba(37,99,235,0.12)',
                  }}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main style={{ flex: 1, padding: '28px 20px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>{children}</main>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid #e6e9ee', background: '#ffffff' }}>
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              padding: '28px 20px',
              display: 'flex',
              gap: 20,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            {/* Contact */}
            <div style={{ minWidth: 220 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Contact</h3>
              <div style={{ marginTop: 8, color: '#374151', fontSize: 14 }}>
                <div>📞 <a href="tel:893837378" style={{ color: '#2563eb', textDecoration: 'none' }}>893837378</a></div>
                <div>📍 Saidpur Road, Rawalpindi</div>
                <div>✉️ <a href="mailto:himayat@gmail.com" style={{ color: '#2563eb', textDecoration: 'none' }}>himayat@gmail.com</a></div>
              </div>
            </div>

            {/* About / Center */}
            <div style={{ flex: 1, minWidth: 300, maxWidth: 520 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>About this project</h3>
              <p style={{ marginTop: 8, color: '#4b5563', lineHeight: 1.5, fontSize: 14 }}>
                A lightweight localStorage-based expense tracker built for small households. Track daily and monthly spending,
                see per-person totals, and maintain mess/attendance records — all stored locally in your browser for privacy
                and simplicity.
              </p>

              <p style={{ marginTop: 12, color: '#374151', fontStyle: 'italic', fontSize: 13 }}>
                “Small tools, big clarity — manage expenses together, effortlessly.”
              </p>
            </div>

            {/* Quick Links */}
            <div style={{ minWidth: 160 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Quick Links</h3>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/dashboard" style={{ color: '#111827', textDecoration: 'none' }}>Dashboard</Link>
                <Link href="/expenses" style={{ color: '#111827', textDecoration: 'none' }}>Expenses</Link>
                <Link href="/people" style={{ color: '#111827', textDecoration: 'none' }}>People</Link>
                <Link href="/attendance" style={{ color: '#111827', textDecoration: 'none' }}>Attendance</Link>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 20px', background: '#fafafa' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: '#6b7280' }}>© {new Date().getFullYear()} My Expense Tracker — All rights reserved.</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Built with ❤️ • LocalStorage demo (single-browser)</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
