'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Protected wrapper component:
 * Usage:
 *  - import Protected from '@/components/Protected';
 *  - return (<Protected><YourPageContent/></Protected>);
 */
export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ok = sessionStorage.getItem('expense-auth');
    if (!ok) {
      router.replace('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280' }}>Checking authentication...</div>
      </div>
    );
  }

  return <>{children}</>;
}
