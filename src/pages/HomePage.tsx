import { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Edit3,
  KeyRound,
  Moon,
  MoreVertical,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { DESIGN_TEMPLATES } from '../data/designTemplates';
import type { AppProject, DesignTemplate, TemplateType } from '../types/project';
import { TEMPLATE_TYPES, getTemplateDisplayName } from '../types/project';

interface HomePageProps {
  projects: AppProject[];
  isLoadingProjects: boolean;
  isDarkTheme: boolean;
  hasPersonalApiKey: boolean;
  isBuilding: boolean;
  buildStatus: string;
  errorMessage: string | null;
  onToggleTheme: () => void;
  onOpenAiSettings: () => void;
  onCraftApp: (prompt: string, templateType: TemplateType) => Promise<void>;
  onLaunchTemplate: (template: DesignTemplate) => Promise<void>;
  onOpenProject: (projectId: string) => void;
  onToggleStar: (project: AppProject) => Promise<void>;
  onDismissError: () => void;
  requestRename: (project: AppProject) => void;
  requestDelete: (project: AppProject) => void;
}

export function HomePage({
  projects,
  isLoadingProjects,
  isDarkTheme,
  hasPersonalApiKey,
  isBuilding,
  buildStatus,
  errorMessage,
  onToggleTheme,
  onOpenAiSettings,
  onCraftApp,
  onLaunchTemplate,
  onOpenProject,
  onToggleStar,
  onDismissError,
  requestRename,
  requestDelete,
}: HomePageProps) {
  const [promptText, setPromptText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('web_app');
  const [searchQuery, setSearchQuery] = useState('');
  const [starredOnly, setStarredOnly] = useState(false);
  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      if (starredOnly && !p.isStarred) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.initialPrompt.toLowerCase().includes(q)
      );
    });
  }, [projects, starredOnly, searchQuery]);

  const handleApplyTemplatePrompt = (template: DesignTemplate) => {
    setPromptText(template.starterPrompt);
    setSelectedTemplate(template.defaultTemplateType);
    onDismissError();
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmitCraft = async () => {
    const trimmed = promptText.trim();
    if (!trimmed || isBuilding) return;
    await onCraftApp(trimmed, selectedTemplate);
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <header className="studio-topbar">
        <div className="studio-topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/favicon.svg"
              alt="Craftable logo"
              width={34}
              height={34}
              style={{ borderRadius: 9, flexShrink: 0 }}
            />
            <span className="brand-title">Craftable</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="status-pill"
              onClick={onOpenAiSettings}
              title={
                hasPersonalApiKey
                  ? 'Personal Gemini key connected in browser'
                  : 'Configure Craft AI connection'
              }
            >
              <span className="status-dot" />
              <span>Studio</span>
              <KeyRound size={13} style={{ opacity: 0.75 }} />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={onToggleTheme}
              aria-label="Toggle light or dark studio theme"
              title="Toggle light or dark studio theme"
            >
              {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        {/* Hero Prompt Studio Composer */}
        <section ref={composerRef} className="hero-card" aria-label="Prompt Composer">
          <div className="hero-card-inner">
            <div className="hero-heading">
              <Sparkles size={20} style={{ color: 'var(--coral)', flexShrink: 0 }} />
              <h1>What do you want to craft?</h1>
            </div>

            <textarea
              className="prompt-textarea"
              value={promptText}
              disabled={isBuilding}
              placeholder="Describe an app, dashboard, or landing page..."
              onChange={(e) => {
                setPromptText(e.target.value);
                if (errorMessage) onDismissError();
              }}
            />

            <div className="chip-row" role="group" aria-label="App category">
              {TEMPLATE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  disabled={isBuilding}
                  className={`chip ${selectedTemplate === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(type.id)}
                >
                  {type.displayName}
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="error-card">
                <div className="error-title">
                  <AlertCircle size={18} />
                  <span>Craft AI did not complete this request</span>
                </div>
                <p className="error-body">{errorMessage}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={handleSubmitCraft}
                    disabled={isBuilding}
                  >
                    <RefreshCw size={16} />
                    <span>Retry</span>
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={onOpenAiSettings}
                  >
                    <KeyRound size={16} />
                    <span>Craft AI Key</span>
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
              onClick={handleSubmitCraft}
              style={{ width: '100%' }}
            >
              {isBuilding ? (
                <>
                  <span className="spinner" />
                  <span>{buildStatus || 'Crafting your app...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Craft App</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Curated Studio Templates Gallery */}
        <section aria-label="Curated studio templates">
          <h2 style={{ margin: 0, fontSize: '1.08rem' }}>Curated studio templates</h2>
          <p className="section-header-sub">
            Open a ready-to-use app immediately or load its prompt into Craft AI
          </p>
          <div className="templates-rail">
            {DESIGN_TEMPLATES.map((template) => (
              <article key={template.id} className="template-card">
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span className="badge">{template.badgeLabel}</span>
                    <div className="swatch-dots" aria-hidden="true">
                      <span className="swatch-dot" style={{ background: template.canvasHex }} />
                      <span className="swatch-dot" style={{ background: template.surfaceHex }} />
                      <span className="swatch-dot" style={{ background: template.accentHex }} />
                    </div>
                  </div>
                  <h3 style={{ margin: '10px 0 4px', fontSize: '1.04rem' }}>{template.name}</h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.84rem',
                      color: 'var(--text-muted)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {template.shortSummary}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isBuilding}
                    onClick={() => onLaunchTemplate(template)}
                    style={{ flex: 1, minHeight: 44 }}
                  >
                    Open App
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={isBuilding}
                    onClick={() => handleApplyTemplatePrompt(template)}
                    style={{ minHeight: 44 }}
                  >
                    Prompt
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Projects Header + Search/Filter */}
        <section aria-label="Your Projects" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Your Projects</h2>
            <button
              type="button"
              className={`chip ${starredOnly ? 'selected' : ''}`}
              onClick={() => setStarredOnly((v) => !v)}
            >
              <Star
                size={15}
                fill={starredOnly ? 'var(--amber)' : 'none'}
                style={{ color: starredOnly ? 'var(--amber)' : 'currentColor' }}
              />
              <span>Starred</span>
            </button>
          </div>

          <div className="search-wrap">
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="search"
              className="search-input"
              value={searchQuery}
              placeholder="Search projects..."
              aria-label="Search projects"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{ position: 'absolute', right: 2 }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {isLoadingProjects ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 36 }}>
              <span className="spinner" style={{ width: 28, height: 28, color: 'var(--coral)' }} />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-card">
              <svg width="88" height="64" viewBox="0 0 88 64" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="84" height="60" rx="14" fill="var(--surface-high)" stroke="var(--border)" strokeWidth="2" />
                <rect x="14" y="14" width="38" height="8" rx="4" fill="var(--coral)" opacity="0.7" />
                <rect x="14" y="28" width="60" height="6" rx="3" fill="var(--border)" />
                <rect x="14" y="40" width="46" height="6" rx="3" fill="var(--border)" />
              </svg>
              <h3 style={{ margin: 0, fontSize: '1.12rem' }}>
                {projects.length > 0 ? 'No matching projects' : 'Your canvas is ready'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 420 }}>
                {projects.length > 0
                  ? 'Try clearing your search or star filter.'
                  : 'Describe an idea above or open a curated studio template to launch your first live interactive app.'}
              </p>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project) => {
                const dateStr = new Date(project.updatedAtMillis).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const menuOpen = openMenuProjectId === project.id;

                return (
                  <article
                    key={project.id}
                    className="project-card"
                    onClick={() => onOpenProject(project.id)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="badge badge-coral">
                          {getTemplateDisplayName(project.templateType)}
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
                            style={{
                              color: project.isStarred ? 'var(--amber)' : 'var(--text-muted)',
                            }}
                          />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() =>
                            setOpenMenuProjectId(menuOpen ? null : project.id)
                          }
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
                                setOpenMenuProjectId(null);
                                requestRename(project);
                              }}
                            >
                              <Edit3 size={16} />
                              <span>Rename Project</span>
                            </button>
                            <button
                              type="button"
                              className="dropdown-item danger"
                              onClick={() => {
                                setOpenMenuProjectId(null);
                                requestDelete(project);
                              }}
                            >
                              <Trash2 size={16} />
                              <span>Delete Project</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: '0 0 4px',
                          fontSize: '1.08rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {project.title}
                      </h3>
                      {project.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.86rem',
                            color: 'var(--text-muted)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {project.description}
                        </p>
                      )}
                    </div>

                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Updated {dateStr}
                    </span>
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
