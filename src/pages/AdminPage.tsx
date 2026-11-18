import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AdminPageProps {
  onNavigateHome: () => void;
  onStatusChanged: () => void;
}

interface AdminSessionState {
  loading: boolean;
  authenticated: boolean;
  hasAdminPassword: boolean;
  keyCount: number;
  ready: boolean;
  persistenceMode: string;
}

export function AdminPage({ onNavigateHome, onStatusChanged }: AdminPageProps) {
  const [session, setSession] = useState<AdminSessionState>({
    loading: true,
    authenticated: false,
    hasAdminPassword: true,
    keyCount: 0,
    ready: false,
    persistenceMode: 'unconfigured',
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [keysInput, setKeysInput] = useState('');
  const [busyAction, setBusyAction] = useState<'login' | 'save' | 'test' | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const loadSession = useCallback(async () => {
    setSession((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch('/api/admin', { method: 'GET', cache: 'no-store' });
      const data = (await res.json()) as {
        authenticated?: boolean;
        hasAdminPassword?: boolean;
        keyCount?: number;
        ready?: boolean;
        persistenceMode?: string;
      };
      setSession({
        loading: false,
        authenticated: Boolean(data.authenticated),
        hasAdminPassword: data.hasAdminPassword ?? true,
        keyCount: data.keyCount ?? 0,
        ready: Boolean(data.ready),
        persistenceMode: data.persistenceMode ?? 'unconfigured',
      });
    } catch {
      setSession((s) => ({ ...s, loading: false, authenticated: false }));
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim() || busyAction) return;
    setBusyAction('login');
    setFeedback(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password: passwordInput }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        authenticated?: boolean;
        keyCount?: number;
        ready?: boolean;
        persistenceMode?: string;
      } | null;

      if (!res.ok) {
        setFeedback({ kind: 'err', text: data?.error || 'Could not sign in.' });
      } else {
        setPasswordInput('');
        setSession({
          loading: false,
          authenticated: true,
          hasAdminPassword: true,
          keyCount: data?.keyCount ?? 0,
          ready: Boolean(data?.ready),
          persistenceMode: data?.persistenceMode ?? 'unconfigured',
        });
      }
    } catch {
      setFeedback({ kind: 'err', text: 'Failed to reach admin server.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busyAction) return;
    setBusyAction('save');
    setFeedback(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_keys', keysText: keysInput }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
        keyCount?: number;
        ready?: boolean;
        persistenceMode?: string;
      } | null;

      if (!res.ok) {
        setFeedback({ kind: 'err', text: data?.error || 'Failed to store keys on server.' });
      } else {
        setKeysInput('');
        setSession((s) => ({
          ...s,
          keyCount: data?.keyCount ?? s.keyCount,
          ready: Boolean(data?.ready),
          persistenceMode: data?.persistenceMode ?? s.persistenceMode,
        }));
        setFeedback({
          kind: 'ok',
          text: data?.message || 'Keys updated securely on the server. Input cleared so no key remains visible.',
        });
        onStatusChanged();
      }
    } catch {
      setFeedback({ kind: 'err', text: 'Network error saving server keys.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleTestKeys = async () => {
    if (busyAction) return;
    setBusyAction('test');
    setFeedback(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_keys' }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!res.ok) {
        setFeedback({ kind: 'err', text: data?.error || 'Key verification failed.' });
      } else {
        setFeedback({ kind: 'ok', text: data?.message || 'Server keys verified live!' });
      }
    } catch {
      setFeedback({ kind: 'err', text: 'Failed to test Gemini connection.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => undefined);
    setKeysInput('');
    setPasswordInput('');
    setFeedback(null);
    setSession((s) => ({ ...s, authenticated: false }));
  };

  const persistenceLabel: Record<string, string> = {
    vercel_env: 'Permanent (Vercel Environment Variables)',
    kv_encrypted: 'Permanent (Encrypted Server KV Vault)',
    env_var: 'Permanent (Server GEMINI_API_KEY)',
    local_file: 'Local Dev Vault (.zuno-keys.local.json)',
    session_memory: 'Active Server Instance Memory',
    unconfigured: 'Not configured yet',
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <header className="studio-topbar">
        <div className="studio-topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="icon-btn"
              onClick={onNavigateHome}
              aria-label="Back to Zuno AI studio"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="brand-title">Zuno AI — Owner Admin</span>
          </div>

          {session.authenticated && (
            <button type="button" className="btn-outline" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </header>

      <main className="home-main" style={{ maxWidth: 640 }}>
        {session.loading ? (
          <div className="empty-card">
            <span className="spinner" style={{ width: 28, height: 28, color: 'var(--coral)' }} />
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Checking admin session...</p>
          </div>
        ) : !session.authenticated ? (
          <section className="hero-card" aria-label="Owner Admin Sign In">
            <div className="hero-card-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={20} style={{ color: 'var(--coral)' }} />
                <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Owner Admin Control</h1>
              </div>

              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Sign in with your owner admin password to manage server-side Gemini API keys.
                Customers never see or access API keys.
              </p>

              {!session.hasAdminPassword && (
                <div className="error-card">
                  <div className="error-title">
                    <ShieldCheck size={18} />
                    <span>Admin Password Not Set on Server</span>
                  </div>
                  <p className="error-body">
                    Add <code className="font-mono">ZUNO_ADMIN_PASSWORD</code> in your Vercel Project
                    Environment Variables (and redeploy) to unlock Owner Admin login. You can also
                    set <code className="font-mono">GEMINI_API_KEY</code> directly in Vercel
                    Environment Variables.
                  </p>
                </div>
              )}

              {feedback && (
                <div className={feedback.kind === 'err' ? 'error-card' : 'card-assistant'}>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>{feedback.text}</p>
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.86rem' }}>
                  <span>Owner Admin Password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter ZUNO_ADMIN_PASSWORD"
                    style={{
                      minHeight: 46,
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                    }}
                  />
                </label>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!passwordInput.trim() || busyAction === 'login'}
                >
                  <ShieldCheck size={18} />
                  <span>{busyAction === 'login' ? 'Verifying...' : 'Unlock Admin Control'}</span>
                </button>
              </form>
            </div>
          </section>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section className="card-assistant">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2
                    size={20}
                    style={{ color: session.ready ? 'var(--emerald)' : 'var(--amber)' }}
                  />
                  <strong className="font-display" style={{ fontSize: '1.05rem' }}>
                    {session.ready
                      ? `${session.keyCount} Server Key(s) Active`
                      : 'No Server Key Active Yet'}
                  </strong>
                </div>
                <span className="badge font-mono">
                  {persistenceLabel[session.persistenceMode] ?? session.persistenceMode}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Write-only security: once saved, API keys are kept exclusively on the server and
                are never sent back to any browser — not even inside this Admin screen.
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-outline"
                  disabled={busyAction !== null || !session.ready}
                  onClick={handleTestKeys}
                >
                  <RefreshCw size={16} />
                  <span>{busyAction === 'test' ? 'Testing...' : 'Test AI Connection'}</span>
                </button>
              </div>
            </section>

            <section className="hero-card">
              <form onSubmit={handleSaveKeys} className="hero-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <KeyRound size={20} style={{ color: 'var(--coral)' }} />
                  <h2 style={{ margin: 0, fontSize: '1.12rem' }}>Paste Server Gemini API Keys</h2>
                </div>

                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  Paste one or more Gemini API keys (one per line or comma-separated). Zuno AI
                  automatically rotates keys on rate limits. Leave blank and save only to clear
                  runtime keys.
                </p>

                <textarea
                  className="prompt-textarea font-mono"
                  value={keysInput}
                  onChange={(e) => setKeysInput(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="AIzaSy...&#10;AIzaSy... (optional backup key)"
                  style={{ minHeight: 108, WebkitTextSecurity: 'disc' } as React.CSSProperties}
                />

                {feedback && (
                  <div className={feedback.kind === 'err' ? 'error-card' : 'card-assistant'}>
                    <p style={{ margin: 0, fontSize: '0.86rem' }}>{feedback.text}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={busyAction !== null}
                >
                  <Sparkles size={18} />
                  <span>{busyAction === 'save' ? 'Saving Securely...' : 'Save Keys to Server'}</span>
                </button>
              </form>
            </section>

            <section className="card-assistant">
              <strong className="font-display" style={{ fontSize: '0.96rem' }}>
                Permanent Vercel Deployment Tip
              </strong>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                For keys pasted here to persist across Vercel serverless cold restarts, set{' '}
                <code className="font-mono">VERCEL_TOKEN</code> +{' '}
                <code className="font-mono">VERCEL_PROJECT_ID</code> (or Vercel KV env vars) in
                Vercel, or paste your key into Vercel &rarr; Settings &rarr; Environment Variables as{' '}
                <code className="font-mono">GEMINI_API_KEY</code>.
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
