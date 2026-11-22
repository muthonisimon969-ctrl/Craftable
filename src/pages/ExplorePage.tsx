import { Box, Eye, Sparkles } from 'lucide-react';
import { AppNavigation, type NavSection } from '../components/AppNavigation';
import { CREATIVE_BLUEPRINTS, type CreativeBlueprint } from '../data/creativeBlueprints';
import type { DesignTemplate, StudioCapability } from '../types/project';

interface ExplorePageProps {
  isDarkTheme: boolean;
  isServerAiReady: boolean;
  isBusy: boolean;
  onNavigate: (section: NavSection) => void;
  onToggleTheme: () => void;
  onInspectWebExample: (template: DesignTemplate) => Promise<void>;
  onInspect3dExample: (blueprint: CreativeBlueprint) => Promise<void>;
  onUseAsInspiration: (prompt: string, capability: StudioCapability) => void;
}

export function ExplorePage({
  isDarkTheme,
  isServerAiReady,
  isBusy,
  onNavigate,
  onToggleTheme,
  onInspectWebExample,
  onInspect3dExample,
  onUseAsInspiration,
}: ExplorePageProps) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 76 }}>
      <AppNavigation
        activeSection="explore"
        isDarkTheme={isDarkTheme}
        isServerAiReady={isServerAiReady}
        onNavigate={onNavigate}
        onToggleTheme={onToggleTheme}
      />

      <main className="home-main">
        <div>
          <div className="zuno-philosophy-pill">
            <span>Interactive Experiences</span>
          </div>
          <h1 style={{ margin: '10px 0 4px', fontSize: '1.55rem' }}>
            Explore 3D Games &amp; Experiences
          </h1>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Play with interactive examples or use an idea as a starting point for something new.
          </p>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box size={18} style={{ color: 'var(--coral)' }} />
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>3D &amp; Interactive Experiments</h2>
          </div>

          <div className="projects-grid">
            {CREATIVE_BLUEPRINTS.map((bp) => (
              <article key={bp.id} className="project-card" style={{ cursor: 'default' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-coral">{bp.badgeLabel}</span>
                    <div className="swatch-dots" aria-hidden="true">
                      <span className="swatch-dot" style={{ background: bp.canvasHex }} />
                      <span className="swatch-dot" style={{ background: bp.surfaceHex }} />
                      <span className="swatch-dot" style={{ background: bp.accentHex }} />
                    </div>
                  </div>
                  <h3 style={{ margin: '10px 0 4px', fontSize: '1.05rem' }}>{bp.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    {bp.shortSummary}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={isBusy}
                    onClick={() => onInspect3dExample(bp)}
                    style={{ flex: 1, minHeight: 42 }}
                  >
                    <Eye size={15} />
                    <span>Inspect Live</span>
                  </button>
                  <button
                    type="button"
                    className="btn-tonal"
                    onClick={() => onUseAsInspiration(bp.starterPrompt, 'create_3d')}
                    style={{ minHeight: 42 }}
                  >
                    <Sparkles size={15} />
                    <span>Remix Idea</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
