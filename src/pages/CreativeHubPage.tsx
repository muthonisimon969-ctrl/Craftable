import { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Box,
  Check,
  Edit3,
  Lock,
  Moon,
  MoreVertical,
  Play,
  RefreshCw,
  Sparkles,
  Star,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import {
  CREATIVE_BLUEPRINTS,
  CREATIVE_QUICK_PROMPTS,
  type CreativeBlueprint,
} from '../data/creativeBlueprints';
import type { AppProject, CreativeCategory } from '../types/project';
import { CREATIVE_CATEGORIES, getCreativeCategoryDisplayName } from '../types/project';

interface CreativeHubPageProps {
  projects: AppProject[];
  isLoadingProjects: boolean;
  isDarkTheme: boolean;
  isServerAiReady: boolean;
  isBuilding: boolean;
  buildStatus: string;
  errorMessage: string | null;
  onNavigateHome: () => void;
  onOpenAdmin: () => void;
  onToggleTheme: () => void;
  onCreateWithAi: (
    prompt: string,
    category: CreativeCategory,
    blueprint: CreativeBlueprint | null
  ) => Promise<void>;
  onLaunchBlueprintStarter: (blueprint: CreativeBlueprint) => Promise<void>;
  onOpenCreativeProject: (projectId: string) => void;
  onToggleStar: (project: AppProject) => Promise<void>;
  onDismissError: () => void;
  requestRename: (project: AppProject) => void;
  requestDelete: (project: AppProject) => void;
}

export function CreativeHubPage({
  projects,
  isLoadingProjects,
  isDarkTheme,
  isServerAiReady,
  isBuilding,
  buildStatus,
  errorMessage,
  onNavigateHome,
  onOpenAdmin,
  onToggleTheme,
  onCreateWithAi,
  onLaunchBlueprintStarter,
  onOpenCreativeProject,
  onToggleStar,
  onDismissError,
  requestRename,
  requestDelete,
}: CreativeHubPageProps) {
  const [promptText, setPromptText] = useState('');
  const [category, setCategory] = useState<CreativeCategory>('3d_game');
  const [selectedBlueprint, setSelectedBlueprint] = useState<CreativeBlueprint | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const handleSelectBlueprint = (bp: CreativeBlueprint) => {
    setSelectedBlueprint(bp);
    setCategory(bp.category);
    if (!promptText.trim() || CREATIVE_BLUEPRINTS.some((b) => b.starterPrompt === promptText.trim())) {
      setPromptText(bp.starterPrompt);
    }
    onDismissError();
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async () => {
    const trimmed = promptText.trim();
    if (!trimmed || isBuilding) return;
    await onCreateWithAi(trimmed, category, selectedBlueprint);
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <header className="studio-topbar">
        <div className="studio-topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="icon-btn"
              onClick={onNavigateHome}
              aria-label="Back to Zuno AI Home"
              title="Back to Zuno AI Home"
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Box size={22} style={{ color: 'var(--coral)', flexShrink: 0 }} />
              <span className="brand-title">Creative Studio</span>
              <span className="badge font-mono">Three.js</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              className="status-pill"
              style={{ cursor: 'default' }}
              title={isServerAiReady ? 'Zuno Creative AI ready' : 'Server keys offline'}
            >
              <span className={`status-dot ${isServerAiReady ? '' : 'needs-key'}`} />
              <span>{isServerAiReady ? 'AI Ready' : 'Offline'}</span>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={onOpenAdmin}
              aria-label="Owner Admin Control"
              title="Owner Admin Control"
            >
              <Lock size={18} />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={onToggleTheme}
              aria-label="Toggle light or dark theme"
            >
              {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        {/* Three.js Project Creation Area */}
        <section ref={composerRef} className="hero-card" aria-label="Three.js Creative Studio Builder">
          <div className="hero-card-inner">
            <div className="hero-heading">
              <Box size={20} style={{ color: 'var(--coral)', flexShrink: 0 }} />
              <h1>Create 3D Games, Worlds &amp; Animations with Three.js</h1>
            </div>

            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Dedicated WebGL &amp; Three.js workspace — kept separate from normal app chat. Describe any 3D game, interactive environment, or 2D/3D animation below.
            </p>

            {selectedBlueprint && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 12,
                  background: 'var(--indigo-container)',
                  color: 'var(--indigo-on-container)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                <span>
                  Three.js Blueprint: <strong>{selectedBlueprint.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBlueprint(null)}
                  aria-label="Clear blueprint"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <textarea
              className="prompt-textarea"
              value={promptText}
              disabled={isBuilding}
              placeholder='Example: "Create a 3D racing game with Kenyan roads."'
              onChange={(e) => {
                setPromptText(e.target.value);
                if (errorMessage) onDismissError();
              }}
            />

            <div className="chip-row" role="group" aria-label="Quick 3D ideas">
              {CREATIVE_QUICK_PROMPTS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  disabled={isBuilding}
                  className="chip"
                  onClick={() => setPromptText(idea)}
                >
                  <Sparkles size={13} style={{ color: 'var(--coral)' }} />
                  <span>{idea}</span>
                </button>
              ))}
            </div>

            <div className="chip-row" role="group" aria-label="Creative Studio mode">
              {CREATIVE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  disabled={isBuilding}
                  className={`chip ${category === cat.id ? 'selected' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.displayName}
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="error-card">
                <div className="error-title">
                  <AlertCircle size={18} />
                  <span>Creative Studio could not generate this scene</span>
                </div>
                <p className="error-body">{errorMessage}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-outline" onClick={handleSubmit} disabled={isBuilding}>
                    <RefreshCw size={16} />
                    <span>Retry</span>
                  </button>
                  <button type="button" className="btn-outline" onClick={onDismissError}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              disabled={!promptText.trim() || isBuilding}
              onClick={handleSubmit}
              style={{ width: '100%' }}
            >
              {isBuilding ? (
                <>
                  <span className="spinner" />
                  <span>{buildStatus || 'Generating 3D Three.js scene...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate 3D Project</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Curated Three.js Blueprints & Playable Starters */}
        <section aria-label="Three.js Creative Blueprints">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: '1.08rem' }}>Three.js Blueprints &amp; Instant Starters</h2>
            <span className="badge badge-neutral">WebGL Sandbox</span>
          </div>
          <p className="section-header-sub">
            Customize a 3D blueprint with AI or launch a playable Three.js scene immediately and modify it via Creative Chat
          </p>
          <div className="templates-rail">
            {CREATIVE_BLUEPRINTS.map((bp) => {
              const isSelected = selectedBlueprint?.id === bp.id;
              return (
                <article
                  key={bp.id}
                  className="template-card"
                  style={isSelected ? { borderColor: 'var(--coral)' } : undefined}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span className="badge">{bp.badgeLabel}</span>
                      <div className="swatch-dots" aria-hidden="true">
                        <span className="swatch-dot" style={{ background: bp.canvasHex }} />
                        <span className="swatch-dot" style={{ background: bp.surfaceHex }} />
                        <span className="swatch-dot" style={{ background: bp.accentHex }} />
                      </div>
                    </div>
                    <h3 style={{ margin: '10px 0 4px', fontSize: '1.04rem' }}>{bp.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {bp.shortSummary}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={isBuilding}
                      onClick={() => handleSelectBlueprint(bp)}
                      style={{ flex: 1, minHeight: 44 }}
                    >
                      {isSelected ? (
                        <>
                          <Check size={16} />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Use with AI</span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      disabled={isBuilding}
                      onClick={() => onLaunchBlueprintStarter(bp)}
                      style={{ minHeight: 44 }}
                    >
                      <Play size={15} />
                      <span>Play 3D</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Creative Studio Projects */}
        <section aria-label="Your 3D Creative Projects" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Your Creative Studio Projects</h2>

          {isLoadingProjects ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <span className="spinner" style={{ width: 28, height: 28, color: 'var(--coral)' }} />
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-card">
              <Box size={36} style={{ color: 'var(--coral)' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>No 3D Creative Projects Yet</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 420 }}>
                Try generating &ldquo;Create a 3D racing game with Kenyan roads&rdquo; above, or click Play 3D on Kenyan Savanna Rally 3D to jump right in.
              </p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => {
                const menuOpen = openMenuId === project.id;
                return (
                  <article
                    key={project.id}
                    className="project-card"
                    onClick={() => onOpenCreativeProject(project.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="badge badge-coral">
                          {getCreativeCategoryDisplayName(project.creativeCategory)}
                        </span>
                        <span className="badge badge-neutral font-mono">v{project.version}</span>
                      </div>

                      <div
                        style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => onToggleStar(project)}
                          aria-label={project.isStarred ? 'Unstar project' : 'Star project'}
                        >
                          <Star
                            size={18}
                            fill={project.isStarred ? 'var(--amber)' : 'none'}
                            style={{ color: project.isStarred ? 'var(--amber)' : 'var(--text-muted)' }}
                          />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setOpenMenuId(menuOpen ? null : project.id)}
                          aria-label="Project options"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {menuOpen && (
                          <div className="dropdown-menu">
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() => {
                                setOpenMenuId(null);
                                requestRename(project);
                              }}
                            >
                              <Edit3 size={16} />
                              <span>Rename</span>
                            </button>
                            <button
                              type="button"
                              className="dropdown-item danger"
                              onClick={() => {
                                setOpenMenuId(null);
                                requestDelete(project);
                              }}
                            >
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.08rem' }}>{project.title}</h3>
                      {project.description && (
                        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
