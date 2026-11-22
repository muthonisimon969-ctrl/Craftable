import { useMemo, useState } from 'react';
import {
  Box,
  Edit3,
  Hammer,
  MoreVertical,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { AppNavigation, type NavSection } from '../components/AppNavigation';
import type { AppProject } from '../types/project';
import { getCreativeCategoryDisplayName, getTemplateDisplayName } from '../types/project';

interface ProjectsPageProps {
  projects: AppProject[];
  isLoadingProjects: boolean;
  isDarkTheme: boolean;
  isServerAiReady: boolean;
  onNavigate: (section: NavSection) => void;
  onToggleTheme: () => void;
  onOpenProject: (project: AppProject) => void;
  onToggleStar: (project: AppProject) => Promise<void>;
  requestRename: (project: AppProject) => void;
  requestDelete: (project: AppProject) => void;
}

export function ProjectsPage({
  projects,
  isLoadingProjects,
  isDarkTheme,
  isServerAiReady,
  onNavigate,
  onToggleTheme,
  onOpenProject,
  onToggleStar,
  requestRename,
  requestDelete,
}: ProjectsPageProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'build' | '3d' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      if (filterMode === 'build' && p.mode === 'creative') return false;
      if (filterMode === '3d' && p.mode !== 'creative') return false;
      if (filterMode === 'starred' && !p.isStarred) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.initialPrompt.toLowerCase().includes(q)
      );
    });
  }, [projects, filterMode, searchQuery]);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 76 }}>
      <AppNavigation
        activeSection="projects"
        isDarkTheme={isDarkTheme}
        isServerAiReady={isServerAiReady}
        onNavigate={onNavigate}
        onToggleTheme={onToggleTheme}
      />

      <main className="home-main">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Your Projects</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Continue building any website, web application, or 3D experience
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={() => onNavigate('home')}>
            <Sparkles size={16} />
            <span>New Creation</span>
          </button>
        </div>

        <div className="chip-row" role="group" aria-label="Filter projects">
          <button
            type="button"
            className={`chip ${filterMode === 'all' ? 'selected' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            All ({projects.length})
          </button>
          <button
            type="button"
            className={`chip ${filterMode === 'build' ? 'selected' : ''}`}
            onClick={() => setFilterMode('build')}
          >
            <Hammer size={14} />
            <span>Web Builds</span>
          </button>
          <button
            type="button"
            className={`chip ${filterMode === '3d' ? 'selected' : ''}`}
            onClick={() => setFilterMode('3d')}
          >
            <Box size={14} />
            <span>3D Experiences</span>
          </button>
          <button
            type="button"
            className={`chip ${filterMode === 'starred' ? 'selected' : ''}`}
            onClick={() => setFilterMode('starred')}
          >
            <Star size={14} />
            <span>Starred</span>
          </button>
        </div>

        <div className="search-wrap">
          <Search
            size={18}
            style={{ position: 'absolute', left: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}
          />
          <input
            type="search"
            className="search-input"
            value={searchQuery}
            placeholder="Search projects by title or prompt..."
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
        ) : filtered.length === 0 ? (
          <div className="empty-card">
            <h2 style={{ margin: 0, fontSize: '1.12rem' }}>
              {projects.length > 0 ? 'No matching projects' : 'No projects yet'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 420 }}>
              {projects.length > 0
                ? 'Try clearing your search or category filter.'
                : 'Describe an original idea on Home or Create to build your first project.'}
            </p>
            <button type="button" className="btn-primary" onClick={() => onNavigate('home')}>
              Start Creating
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {filtered.map((project) => {
              const is3d = project.mode === 'creative';
              const dateStr = new Date(project.updatedAtMillis).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const menuOpen = openMenuId === project.id;

              return (
                <article
                  key={project.id}
                  className="project-card"
                  onClick={() => onOpenProject(project)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`badge ${is3d ? 'badge-coral' : ''}`}>
                        {is3d
                          ? getCreativeCategoryDisplayName(project.creativeCategory)
                          : getTemplateDisplayName(project.templateType)}
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

                  <div className={`project-preview-art ${is3d ? 'is-3d' : 'is-web'}`} aria-hidden="true">
                    <div className="project-preview-browser">
                      <div className="project-preview-chrome"><i /><i /><i /><span>{project.title}</span></div>
                      <div className="project-preview-content">
                        <div className="project-preview-copy"><b>{is3d ? '3D EXPERIENCE' : 'YOUR NEXT BIG IDEA'}</b><span /><span /><em /></div>
                        <div className="project-preview-visual"><div /><div /><div /></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.08rem' }}>{project.title}</h3>
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
      </main>
    </div>
  );
}
