import { Lock, Moon, RefreshCw, Server, Sun } from 'lucide-react';
import { AppNavigation, type NavSection } from '../components/AppNavigation';
import { getPlatformArchitectureStatus } from '../services/platformServices';

interface SettingsPageProps {
  isDarkTheme: boolean;
  isServerAiReady: boolean;
  onNavigate: (section: NavSection) => void;
  onToggleTheme: () => void;
  onRefreshStatus: () => void;
  onOpenAdmin: () => void;
}

export function SettingsPage({
  isDarkTheme,
  isServerAiReady,
  onNavigate,
  onToggleTheme,
  onRefreshStatus,
  onOpenAdmin,
}: SettingsPageProps) {
  const modules = getPlatformArchitectureStatus(isServerAiReady);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 76 }}>
      <AppNavigation
        activeSection="settings"
        isDarkTheme={isDarkTheme}
        isServerAiReady={isServerAiReady}
        onNavigate={onNavigate}
        onToggleTheme={onToggleTheme}
      />

      <main className="home-main" style={{ maxWidth: 720 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Settings &amp; Workspace Architecture</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Customize appearance and inspect connected server, storage, and integration hooks.
          </p>
        </div>

        {/* Appearance Card */}
        <section className="card-assistant">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <strong className="font-display" style={{ fontSize: '1rem' }}>Studio Appearance</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Switch between Dark and Light mode across Zuno AI
              </p>
            </div>
            <button type="button" className="btn-outline" onClick={onToggleTheme}>
              {isDarkTheme ? <Sun size={17} /> : <Moon size={17} />}
              <span>{isDarkTheme ? 'Switch to Light' : 'Switch to Dark'}</span>
            </button>
          </div>
        </section>

        {/* Architecture Readiness */}
        <section className="card-assistant">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Server size={18} style={{ color: 'var(--coral)' }} />
              <strong className="font-display" style={{ fontSize: '1rem' }}>
                Modular Backend &amp; Integration Status
              </strong>
            </div>
            <button type="button" className="icon-btn" onClick={onRefreshStatus} aria-label="Refresh status">
              <RefreshCw size={17} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {modules.map((mod) => (
              <div
                key={mod.id}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 14,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: '0.92rem' }}>{mod.title}</strong>
                  <span
                    className={`badge ${
                      mod.state === 'connected'
                        ? ''
                        : mod.state === 'unconfigured'
                        ? 'badge-coral'
                        : 'badge-neutral'
                    }`}
                  >
                    {mod.state}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                  {mod.summary}
                </p>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {mod.endpointOrDriver}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Owner Admin Vault Access */}
        <section className="card-assistant">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <strong className="font-display" style={{ fontSize: '1rem' }}>Owner Key Control</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Server-side write-only API key management protected by owner password. Customers never see or enter API keys.
              </p>
            </div>
            <button type="button" className="btn-primary" onClick={onOpenAdmin}>
              <Lock size={16} />
              <span>Owner Admin (/admin)</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
