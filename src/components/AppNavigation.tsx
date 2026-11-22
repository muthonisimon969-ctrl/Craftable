import {
  Box,
  Compass,
  FolderKanban,
  Home,
  MessageSquare,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';

export type NavSection =
  | 'home'
  | 'chat'
  | 'build'
  | 'create'
  | 'projects'
  | 'explore'
  | 'settings';

interface AppNavigationProps {
  activeSection: NavSection;
  isDarkTheme: boolean;
  isServerAiReady: boolean;
  onNavigate: (section: NavSection) => void;
  onToggleTheme: () => void;
}

const NAV_ITEMS: Array<{ id: NavSection; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'create', label: 'Create', icon: Box },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AppNavigation({
  activeSection,
  isDarkTheme,
  isServerAiReady,
  onNavigate,
  onToggleTheme,
}: AppNavigationProps) {
  return (
    <>
      <header className="zuno-nav-bar">
        <div className="zuno-nav-inner">
          <button
            type="button"
            className="brand-lockup"
            onClick={() => onNavigate('home')}
            aria-label="Zuno AI Home"
          >
            <img
              src="/favicon.svg"
              alt="Zuno AI logo"
              width={32}
              height={32}
              style={{ borderRadius: 9, flexShrink: 0 }}
            />
            <span className="brand-title">Zuno AI</span>
          </button>

          <nav className="zuno-nav-links" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`zuno-nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="status-pill"
              onClick={() => onNavigate('settings')}
              title={
                isServerAiReady
                  ? 'Zuno AI engine connected on server'
                  : 'Server AI keys need configuration in Admin'
              }
            >
              <span className={`status-dot ${isServerAiReady ? '' : 'needs-key'}`} />
              <span>{isServerAiReady ? 'AI Ready' : 'Offline'}</span>
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={onToggleTheme}
              aria-label="Toggle dark or light theme"
              title="Toggle theme"
            >
              {isDarkTheme ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </div>
      </header>

      <nav className="zuno-mobile-dock" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`zuno-dock-btn ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
