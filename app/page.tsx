import Link from 'next/link';
import './globals.css';

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("/photo.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px 30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#1a202c',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ExpenseTracker Pro
          </h1>
          <div
            style={{
              width: '80px',
              height: '4px',
              background: 'linear-gradient(90deg, #2563eb, #059669)',
              margin: '0 auto 20px auto',
              borderRadius: '2px',
            }}
          ></div>
          <p
            style={{
              fontSize: '20px',
              color: '#4a5568',
              fontWeight: '500',
              lineHeight: '1.4',
            }}
          >
            Smart Financial Management for Modern Living
          </p>
        </div>

        {/* Main Description */}
        <div style={{ marginBottom: '40px' }}>
          <p
            style={{
              fontSize: '18px',
              color: '#2d3748',
              lineHeight: '1.7',
              marginBottom: '30px',
              maxWidth: '800px',
              margin: '0 auto 30px auto',
            }}
          >
            A comprehensive solution for managing your daily{' '}
            <span style={{ color: '#7c3aed', fontWeight: '600' }}>expenses</span>, 
            tracking shared costs among groups, and maintaining accurate{' '}
            <span style={{ color: '#d97706', fontWeight: '600' }}>attendance records</span>. 
            Built with privacy in mind—all data stays securely in your browser using{' '}
            <span style={{ color: '#0369a1', fontWeight: '600' }}>localStorage</span>.
          </p>

          {/* Feature Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(229, 231, 235, 0.8)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#2563eb',
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '12px',
                }}
              >
                💰 Expense Tracking
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                Record daily spending with detailed categorization and notes
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(229, 231, 235, 0.8)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#059669',
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '12px',
                }}
              >
                👥 Shared Costs
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                Split expenses and track balances between multiple people
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(229, 231, 235, 0.8)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#7c3aed',
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '12px',
                }}
              >
                📊 Analytics
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                Visual insights into spending patterns and trends over time
              </div>
            </div>

            
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/login"
            style={{
              padding: '14px 32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
              border: 'none',
              cursor: 'pointer',
              minWidth: '160px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
            className="hover-button"
          >
            Get Started
          </Link>

          <Link
            href="/dashboard"
            style={{
              padding: '14px 32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)',
              border: 'none',
              cursor: 'pointer',
              minWidth: '160px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
            className="hover-button"
          >
            Open Dashboard
          </Link>
        </div>

        {/* Features List */}
        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '40px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              maxWidth: '1000px',
              margin: '0 auto',
              textAlign: 'left',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '20px',
                }}
              >
                Core Features
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', color: '#374151' }}>
                  <span style={{ color: '#10b981', marginRight: '12px', fontSize: '18px' }}>✓</span>
                  <span>Add expenses with item details, price, date, and buyer information</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', color: '#374151' }}>
                  <span style={{ color: '#10b981', marginRight: '12px', fontSize: '18px' }}>✓</span>
                  <span>Manage people and groups with easy add/remove functionality</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', color: '#374151' }}>
                  <span style={{ color: '#10b981', marginRight: '12px', fontSize: '18px' }}>✓</span>
                  <span>Comprehensive dashboard with daily & monthly analytics</span>
                </li>
              </ul>
            </div>

            <div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '20px',
                }}
              >
                Advanced Capabilities
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', color: '#374151' }}>
                  <span style={{ color: '#10b981', marginRight: '12px', fontSize: '18px' }}>✓</span>
                  <span>Attendance tracking and mess day management system</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', color: '#374151' }}>
                  <span style={{ color: '#10b981', marginRight: '12px', fontSize: '18px' }}>✓</span>
                  <span>Per-person expense breakdown and total calculations</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', color: '#374151' }}>
                  <span style={{ color: '#10b981', marginRight: '12px', fontSize: '18px' }}>✓</span>
                  <span>Secure local storage with automatic data persistence</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '30px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <p
            style={{
              color: '#6b7280',
              fontStyle: 'italic',
              fontSize: '16px',
              margin: 0,
            }}
          >
            "Empowering financial clarity through intelligent expense management"
          </p>
        </div>
      </div>
    </div>
  );
}