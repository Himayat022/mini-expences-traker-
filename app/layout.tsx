import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mini Expense Tracker',
  description: 'A clean and modern expense tracking app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <main style={styles.main}>{children}</main>
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    fontFamily: `'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
    background: 'linear-gradient(135deg, #e0e7ff, #f8fafc)',
    color: '#1e293b',
    minHeight: '100vh',
  },
  main: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
  },
};
