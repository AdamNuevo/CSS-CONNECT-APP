import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from './services/api';
import { ConsultationsPage } from './features/consultations/ConsultationsPage';
import { AttendanceScannerPage, EventManagementPage } from './features/events/EventManagementPage';
import { OrgOfficerPage } from './features/organizations/OrgOfficerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const C = {
  navy: '#1E2A78',
  blue: '#2563EB',
  bg: '#F4F5FB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textSub: '#4B5563',
  textMuted: '#9CA3AF',
};

type Tab = 'consultations' | 'events' | 'scanner' | 'organizations';

const FACULTY_TABS: { id: Tab; label: string }[] = [
  { id: 'consultations', label: 'Consultations' },
];

const ORG_OFFICER_TABS: { id: Tab; label: string }[] = [
  { id: 'organizations', label: 'Student Organizations' },
  { id: 'events', label: 'Events' },
];

const ADMIN_TABS: { id: Tab; label: string }[] = [
  { id: 'consultations', label: 'Consultations' },
  { id: 'events', label: 'Event Management' },
  { id: 'scanner', label: 'QR Scanner' },
  { id: 'organizations', label: 'Student Organizations' },
];

function StaffLogin({
  onLoginSuccess,
}: {
  onLoginSuccess: (user: any, token: string) => void;
}) {
  const [email, setEmail] = useState('jose.reyes@ccs.qcu.edu.ph');
  const [password, setPassword] = useState('TempPass1!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data;

      if (user.role !== 'faculty' && user.role !== 'admin' && user.role !== 'org_officer') {
        setError('This portal is reserved for faculty, org officers, and administrators.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('ccs_faculty_token', accessToken);
      localStorage.setItem('ccs_faculty_user', JSON.stringify(user));
      onLoginSuccess(user, accessToken);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: 6,
    border: '1px solid #D1D5DB',
    fontSize: 14,
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.bg,
        fontFamily: 'system-ui, sans-serif',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: C.surface,
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: 32,
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.blue,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Quezon City University
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: '4px 0 0 0' }}>
            CCS Hub Staff Portal
          </h1>
          <p style={{ fontSize: 13, color: C.textSub, margin: '6px 0 0 0' }}>
            Faculty, Org Officers, and Administrator Dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 16,
              border: '1px solid #FECACA',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 6,
              }}
            >
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: C.navy,
              color: '#fff',
              border: 'none',
              padding: 12,
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          Faculty: jose.reyes@ccs.qcu.edu.ph / TempPass1!
          <br />
          Admin: admin@ccs.qcu.edu.ph / TempPass1!
        </div>
      </div>
    </div>
  );
}

function PortalLayout({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const tabs =
    user.role === 'admin'
      ? ADMIN_TABS
      : user.role === 'org_officer'
      ? ORG_OFFICER_TABS
      : FACULTY_TABS;

  const [activeTab, setActiveTab] = useState<Tab>(tabs[0].id);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: C.bg,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Top nav */}
      <header
        style={{
          backgroundColor: C.navy,
          color: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>CCS Hub</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '2px 8px',
              borderRadius: 999,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {user.role}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>
            {user.firstName} {user.lastName}
          </span>
          <button
            onClick={onSignOut}
            style={{
              padding: '5px 14px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Tab bar (only shown when multiple tabs) */}
      {tabs.length > 1 && (
        <div
          style={{
            backgroundColor: C.surface,
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            padding: '0 24px',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${C.navy}` : '2px solid transparent',
                backgroundColor: 'transparent',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 14,
                color: activeTab === tab.id ? C.navy : C.textSub,
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Page content */}
      <main>
        {activeTab === 'consultations' && (
          <ConsultationsPage user={user} onSignOut={onSignOut} hideShell />
        )}
        {activeTab === 'events' && <EventManagementPage />}
        {activeTab === 'scanner' && <AttendanceScannerPage />}
        {activeTab === 'organizations' && <OrgOfficerPage />}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ccs_faculty_user');
    const token = localStorage.getItem('ccs_faculty_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('ccs_faculty_user');
        localStorage.removeItem('ccs_faculty_token');
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('ccs_faculty_token');
    localStorage.removeItem('ccs_faculty_user');
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      {user ? (
        <PortalLayout user={user} onSignOut={handleSignOut} />
      ) : (
        <StaffLogin onLoginSuccess={(u) => setUser(u)} />
      )}
    </QueryClientProvider>
  );
}
