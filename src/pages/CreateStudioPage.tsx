import { useRef, useState } from 'react';
import {
  AlertCircle,
  Box,
  Download,
  Image as ImageIcon,
  Paperclip,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { AppNavigation, type NavSection } from '../components/AppNavigation';
import { ThreeShowcaseWidget } from '../components/ThreeShowcaseWidget';
import { CREATIVE_BLUEPRINTS, type CreativeBlueprint } from '../data/creativeBlueprints';
import type {
  AppProject,
  CreativeCategory,
  GeneratedVisualAsset,
  PromptAttachment,
} from '../types/project';
import { CREATIVE_CATEGORIES, getCreativeCategoryDisplayName } from '../types/project';
import { readPromptAttachments } from '../utils/attachmentReader';

interface CreateStudioPageProps {
  creativeProjects: AppProject[];
  createdImages: GeneratedVisualAsset[];
  isDarkTheme: boolean;
  isServerAiReady: boolean;
  isBusy: boolean;
  busyStatus: string;
  errorMessage: string | null;
  onNavigate: (section: NavSection) => void;
  onToggleTheme: () => void;
  onCreate3dProject: (
    prompt: string,
    category: CreativeCategory,
    attachments: PromptAttachment[]
  ) => Promise<void>;
  onLaunch3dStarter: (blueprint: CreativeBlueprint) => Promise<void>;
  onOpenCreativeProject: (projectId: string) => void;
  onGenerateImage: (prompt: string, attachments: PromptAttachment[]) => Promise<void>;
  onDismissError: () => void;
}

export function CreateStudioPage({
  creativeProjects,
  createdImages,
  isDarkTheme,
  isServerAiReady,
  isBusy,
  busyStatus,
  errorMessage,
  onNavigate,
  onToggleTheme,
  onCreate3dProject,
  onLaunch3dStarter,
  onOpenCreativeProject,
  onGenerateImage,
  onDismissError,
}: CreateStudioPageProps) {
  const [activeStudioTab, setActiveStudioTab] = useState<'3d' | 'image'>('3d');
  const [promptText, setPromptText] = useState('');
  const [category, setCategory] = useState<CreativeCategory>('3d_game');
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [attachErr, setAttachErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttachErr(null);
    try {
      const parsed = await readPromptAttachments(files);
      setAttachments((prev) => [...prev, ...parsed].slice(0, 4));
    } catch (err) {
      setAttachErr(err instanceof Error ? err.message : 'Could not read attachment.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    const trimmed = promptText.trim();
    if (!trimmed || isBusy) return;
    if (activeStudioTab === 'image') {
      await onGenerateImage(trimmed, attachments);
    } else {
      await onCreate3dProject(trimmed, category, attachments);
    }
  };

  const downloadImage = (asset: GeneratedVisualAsset) => {
    const link = document.createElement('a');
    link.href = asset.imageDataUrl;
    link.download = `zuno-visual-${asset.createdAtMillis}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 72 }}>
      <AppNavigation
        activeSection="create"
        isDarkTheme={isDarkTheme}
        isServerAiReady={isServerAiReady}
        onNavigate={onNavigate}
        onToggleTheme={onToggleTheme}
      />

      <main className="home-main">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="zuno-philosophy-pill" style={{ alignSelf: 'flex-start' }}>
              <Box size={14} style={{ color: 'var(--coral)' }} />
              <span>Zuno Create Studio &bull; Three.js + Visual AI</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
              Create 3D Worlds, Games &amp; Visuals
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              Generate interactive Three.js 3D products, animations, and playable games, or create visual assets with Gemini Image AI.
            </p>
          </div>
          <ThreeShowcaseWidget heightPx={190} />
        </div>

        {/* Switcher between 3D Studio and AI Image Creation */}
        <div className="segmented-control two-col" role="tablist" style={{ width: '100%', maxWidth: 360 }}>
          <button
            type="button"
            role="tab"
            aria-selected={activeStudioTab === '3d'}
            className={`seg-item ${activeStudioTab === '3d' ? 'active' : ''}`}
            onClick={() => {
              setActiveStudioTab('3d');
              onDismissError();
            }}
          >
            <Box size={16} />
            <span>3D &amp; Three.js</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeStudioTab === 'image'}
            className={`seg-item ${activeStudioTab === 'image' ? 'active' : ''}`}
            onClick={() => {
              setActiveStudioTab('image');
              onDismissError();
            }}
          >
            <ImageIcon size={16} />
            <span>AI Images</span>
          </button>
        </div>

        {/* Unified Creation Composer */}
        <section className="hero-card">
          <div className="hero-card-inner">
            <textarea
              className="prompt-textarea"
              value={promptText}
              disabled={isBusy}
              placeholder={
                activeStudioTab === 'image'
                  ? 'Describe an image, concept art, product render, or texture to generate...'
                  : 'Describe an interactive 3D game, 3D product showcase, or animated WebGL environment...'
              }
              onChange={(e) => {
                setPromptText(e.target.value);
                if (errorMessage) onDismissError();
              }}
            />

            {activeStudioTab === '3d' && (
              <div className="chip-row" role="group" aria-label="3D Studio category">
                {CREATIVE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={isBusy}
                    className={`chip ${category === cat.id ? 'selected' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    {cat.displayName}
                  </button>
                ))}
              </div>
            )}

            {attachments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {attachments.map((att) => (
                  <div key={att.id} className="attachment-chip">
                    {att.previewUrl && (
                      <img src={att.previewUrl} alt={att.name} className="attachment-thumb" />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {att.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachments((p) => p.filter((x) => x.id !== att.id))}
                      aria-label={`Remove ${att.name}`}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {attachErr && (
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--rose)' }}>{attachErr}</p>
            )}

            {errorMessage && (
              <div className="error-card">
                <div className="error-title">
                  <AlertCircle size={17} />
                  <span>Creation Error</span>
                </div>
                <p className="error-body">{errorMessage}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,.txt,.md,.json"
                style={{ display: 'none' }}
                onChange={handleFilePick}
              />
              <button
                type="button"
                className="btn-outline"
                disabled={isBusy}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={16} />
                <span>Reference File</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                disabled={!promptText.trim() || isBusy}
                onClick={handleSubmit}
                style={{ flex: 1 }}
              >
                {isBusy ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                    <span>{busyStatus || 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    <span>{activeStudioTab === 'image' ? 'Generate Image' : 'Create 3D Experience'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {activeStudioTab === 'image' ? (
          <section aria-label="Generated Visuals" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Generated Images</h2>
            {createdImages.length === 0 ? (
              <div className="empty-card">
                <ImageIcon size={32} style={{ color: 'var(--coral)' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Describe a visual concept above to generate a live AI image using your server Gemini configuration.
                </p>
              </div>
            ) : (
              <div className="projects-grid">
                {createdImages.map((img) => (
                  <article key={img.id} className="project-card" style={{ cursor: 'default' }}>
                    <img
                      src={img.imageDataUrl}
                      alt={img.prompt}
                      style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 240 }}
                    />
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {img.prompt}
                    </p>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => downloadImage(img)}
                      style={{ minHeight: 40 }}
                    >
                      <Download size={15} />
                      <span>Download PNG</span>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {creativeProjects.length > 0 && (
              <section aria-label="Your 3D Creations" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Recent 3D Creations</h2>
                <div className="projects-grid">
                  {creativeProjects.slice(0, 6).map((p) => (
                    <article key={p.id} className="project-card" onClick={() => onOpenCreativeProject(p.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-coral">
                          {getCreativeCategoryDisplayName(p.creativeCategory)}
                        </span>
                        <span className="badge badge-neutral font-mono">v{p.version}</span>
                      </div>
                      <h3 style={{ margin: '6px 0 2px', fontSize: '1.04rem' }}>{p.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {p.description}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section aria-label="Interactive 3D Examples">
              <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Instant Playable 3D Experiments</h2>
              <div className="projects-grid">
                {CREATIVE_BLUEPRINTS.map((bp) => (
                  <article key={bp.id} className="project-card" style={{ cursor: 'default' }}>
                    <div>
                      <span className="badge">{bp.badgeLabel}</span>
                      <h3 style={{ margin: '8px 0 4px', fontSize: '1.04rem' }}>{bp.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {bp.shortSummary}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-outline"
                      disabled={isBusy}
                      onClick={() => onLaunch3dStarter(bp)}
                    >
                      <Play size={15} />
                      <span>Open in 3D Studio</span>
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
