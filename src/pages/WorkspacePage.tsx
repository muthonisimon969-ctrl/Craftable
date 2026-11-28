import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Code2,
  Download,
  Edit3,
  Maximize2,
  MessageSquare,
  MoreVertical,
  Play,
  RefreshCw,
  Share2,
  Star,
  Terminal,
} from 'lucide-react';
import { BuilderChatPane } from '../components/BuilderChatPane';
import { CodeExplorerPane } from '../components/CodeExplorerPane';
import { WebPreviewPane } from '../components/WebPreviewPane';
import { iterateExistingApp } from '../services/craftAiService';
import { compileDocumentParts } from '../ir-engine/compiler';
import { applyAssetSwap, applyHeadlineEdit, applyHeroMoodShift, computeDrift, makeRevision, rollbackDocument } from '../ir-engine/revisions';
import type { IrDocument, IrRevision } from '../ir-engine/types';
import * as storage from '../services/projectStorage';
import type {
  AppProject,
  CodeFileTab,
  ConsoleEntry,
  ProjectMessage,
  WorkspaceTab,
} from '../types/project';
import { assembleStandaloneExport } from '../utils/webBundleAssembler';

interface WorkspacePageProps {
  projectId: string;
  onNavigateBack: () => void;
  onProjectUpdated: (project: AppProject) => void;
  onRequestRename: (project: AppProject) => void;
}

export function WorkspacePage({
  projectId,
  onNavigateBack,
  onProjectUpdated,
  onRequestRename,
}: WorkspacePageProps) {
  const [project, setProject] = useState<AppProject | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('preview');
  const [selectedCodeFile, setSelectedCodeFile] = useState<CodeFileTab>('index.html');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  const [draftHtml, setDraftHtml] = useState('');
  const [draftCss, setDraftCss] = useState('');
  const [draftJs, setDraftJs] = useState('');
  const [irHeadline, setIrHeadline] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(1);

  const [promptInput, setPromptInput] = useState('');
  const [pendingUserPrompt, setPendingUserPrompt] = useState<string | null>(null);
  const [failedUserPrompt, setFailedUserPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([
    'Use manual M-Pesa Till payment',
    'Make it look more luxurious',
    'Make the design cleaner',
  ]);

  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [showConsoleSheet, setShowConsoleSheet] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  // Keep the builder in its full desktop workspace on every device.
  // Narrow screens pan the same chat + preview canvas instead of switching editors.
  const isWideScreen = true;

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([storage.getProject(projectId), storage.listMessages(projectId)])
      .then(([proj, msgs]) => {
        if (!active) return;
        setProject(proj);
        setMessages(msgs);
        if (proj) {
          setDraftHtml(proj.htmlCode);
          setDraftCss(proj.cssCode);
          setDraftJs(proj.jsCode);
          const heroNode = proj.irDocument?.sections.find((section) => section.role === 'hero')?.nodes[0];
          setIrHeadline(heroNode?.title ?? '');
          setHasUnsavedChanges(false);
          setReloadNonce((n) => n + 1);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const appendConsoleLog = useCallback((level: ConsoleEntry['level'], message: string) => {
    setConsoleLogs((prev) => [
      ...prev.slice(-99),
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        level,
        message,
        timestampMs: Date.now(),
      },
    ]);
  }, []);

  const handleSelectTab = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    if (tab !== 'preview') {
      setIsFullscreenPreview(false);
    }
  };

  const handleSendIteration = async (overridePrompt?: string) => {
    if (!project || isGenerating) return;
    if (project.irDocument) {
      setErrorMessage('This project is IR-managed. Use the scoped design controls below; unrestricted AI rewrites are disabled to protect its design history.');
      return;
    }
    const prompt = (overridePrompt ?? promptInput).trim();
    if (!prompt) return;

    if (!overridePrompt) setPromptInput('');
    setPendingUserPrompt(prompt);
    setFailedUserPrompt(null);
    setIsGenerating(true);
    setGenerationStage('Connecting to Zuno AI...');
    setErrorMessage(null);

    try {
      const bundle = await iterateExistingApp(
        project,
        prompt,
        messages,
        draftHtml,
        draftCss,
        draftJs,
        (stage) => setGenerationStage(stage)
      );

      setGenerationStage(`Deploying v${project.version + 1} to preview...`);
      const { project: updatedProj, messages: updatedMsgs } = await storage.applyIterationTurn(
        project.id,
        prompt,
        project.version,
        bundle
      );

      setProject(updatedProj);
      setMessages(updatedMsgs);
      onProjectUpdated(updatedProj);
      setDraftHtml(updatedProj.htmlCode);
      setDraftCss(updatedProj.cssCode);
      setDraftJs(updatedProj.jsCode);
      setHasUnsavedChanges(false);
      setFollowUpSuggestions(bundle.followUpSuggestions);
      setConsoleLogs([]);
      setReloadNonce((n) => n + 1);
      setPendingUserPrompt(null);
      setIsGenerating(false);
      setGenerationStage('');
    } catch (err) {
      setIsGenerating(false);
      setPendingUserPrompt(null);
      setFailedUserPrompt(prompt);
      setGenerationStage('');
      setErrorMessage(
        err instanceof Error ? err.message : 'Zuno AI could not complete this request.'
      );
    }
  };

  const handleSaveAndRunManual = async () => {
    if (!project || isSavingCode) return;
    setIsSavingCode(true);
    try {
      const updated = await storage.updateProjectCodeManual(
        project.id,
        project.version,
        draftHtml,
        draftCss,
        draftJs
      );
      setProject(updated);
      onProjectUpdated(updated);
      setHasUnsavedChanges(false);
      setConsoleLogs([]);
      setReloadNonce((n) => n + 1);
      setActiveTab('preview');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save code edits.');
    } finally {
      setIsSavingCode(false);
    }
  };

  const applyIrChange = async (kind: 'headline' | 'asset' | 'mood' | 'rollback') => {
    if (!project?.irDocument || isSavingCode) return;
    try {
      const current = project.irDocument;
      const history = project.irRevisions ?? [];
      const parent = history[history.length - 1];
      let next: IrDocument;
      let label: string;
      let revisionKind: IrRevision['kind'] = 'edit';
      if (kind === 'headline') {
        const hero = current.sections.find((section) => section.role === 'hero')?.nodes[0];
        if (!hero) throw new Error('Hero section is missing.');
        next = applyHeadlineEdit(current, hero.id, irHeadline.trim() || 'A considered beginning');
        label = 'Hero headline edit';
      } else if (kind === 'asset') {
        const hero = current.sections.find((section) => section.role === 'hero')?.nodes[0];
        if (!hero?.imageAssetId) throw new Error('This brand has no hero image to swap.');
        const nextAsset = hero.imageAssetId === 'jbl-charge-6' ? 'jbl-flip-7' : 'jbl-charge-6';
        next = applyAssetSwap(current, hero.id, nextAsset, 'User selected a fitting approved product image.');
        label = 'Approved hero image swap';
      } else if (kind === 'mood') {
        const hero = current.sections.find((section) => section.role === 'hero');
        if (!hero) throw new Error('Hero section is missing.');
        const mood = hero.moodOverride === 'warm-editorial' ? current.anchor.mood : 'warm-editorial';
        next = applyHeroMoodShift(current, hero.id, mood, 'User explicitly changed the hero mood.');
        label = 'Scoped hero mood shift';
      } else {
        if (history.length < 2) throw new Error('There is no earlier revision to restore.');
        const previous = history[history.length - 2];
        next = rollbackDocument(previous);
        label = 'Rollback to ' + previous.label;
        revisionKind = 'rollback';
      }
      const anchorRevision = history.find((item) => item.kind === 'initial') ?? history[0];
      const latestOverride = next.overrides[next.overrides.length - 1];
      const heroNodeId = next.sections.find((section) => section.role === 'hero')?.nodes[0]?.id;
      const affectedIds = latestOverride?.affectedIds ?? (kind === 'headline' && heroNodeId ? [heroNodeId] : []);
      const drift = anchorRevision
        ? computeDrift(anchorRevision.document.anchor, next, anchorRevision.document.sections)
        : undefined;
      const revision = makeRevision(next, label, revisionKind, parent?.id ?? null, {
        affectedIds,
        ...(latestOverride?.overrideReason ? { overrideReason: latestOverride.overrideReason } : kind === 'headline' ? { overrideReason: 'User requested a hero headline change.' } : {}),
        ...(drift ? { drift } : {}),
      });
      const nextHistory = [...history, revision].slice(-20);
      const compiled = compileDocumentParts(next);
      const updated = await storage.saveIrProjectState(
        project.id, project.version, next, nextHistory, compiled.html, compiled.css, compiled.js
      );
      setProject(updated);
      onProjectUpdated(updated);
      setDraftHtml(updated.htmlCode);
      setDraftCss(updated.cssCode);
      setDraftJs(updated.jsCode);
      const updatedHero = updated.irDocument?.sections.find((section) => section.role === 'hero')?.nodes[0];
      setIrHeadline(updatedHero?.title ?? '');
      setHasUnsavedChanges(false);
      setReloadNonce((value) => value + 1);
      setConsoleLogs([]);
      setActiveTab('preview');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The scoped design edit could not be saved safely.');
    }
  };

  const handleToggleStar = async () => {
    if (!project) return;
    const updated = await storage.toggleProjectStar(project.id, !project.isStarred);
    if (updated) {
      setProject(updated);
      onProjectUpdated(updated);
    }
  };

  const handleDownloadHtml = () => {
    if (!project) return;
    const html = assembleStandaloneExport(project.title, draftHtml, draftCss, draftJs);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'zuno-ai-app';
    link.href = url;
    link.download = `${safeName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareHtml = async () => {
    if (!project) return;
    const html = assembleStandaloneExport(project.title, draftHtml, draftCss, draftJs);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${project.title} — Zuno AI App`,
          text: html,
        });
        return;
      } catch {
        // Fallback to download
      }
    }
    handleDownloadHtml();
  };

  if (isLoading) {
    return (
      <div className="workspace-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: 28, height: 28, color: 'var(--coral)' }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="workspace-shell" style={{ alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Project not found.</p>
        <button type="button" className="btn-primary" onClick={onNavigateBack}>
          Back to Projects
        </button>
      </div>
    );
  }

  const renderPreview = () => (
    <WebPreviewPane
      title={project.title}
      htmlCode={draftHtml}
      cssCode={draftCss}
      jsCode={draftJs}
      reloadNonce={reloadNonce}
      isFullscreen={isFullscreenPreview}
      consoleLogs={consoleLogs}
      showConsoleSheet={showConsoleSheet}
      onToggleFullscreen={() => setIsFullscreenPreview((v) => !v)}
      onDismissConsole={() => setShowConsoleSheet(false)}
      onClearConsole={() => setConsoleLogs([])}
      onConsoleMessage={appendConsoleLog}
    />
  );

  const renderCode = () => (
    <CodeExplorerPane
      selectedFile={selectedCodeFile}
      htmlCode={draftHtml}
      cssCode={draftCss}
      jsCode={draftJs}
      hasUnsavedChanges={hasUnsavedChanges}
      isSaving={isSavingCode}
      onSelectFile={setSelectedCodeFile}
      onCodeChanged={(val) => {
        setHasUnsavedChanges(true);
        if (selectedCodeFile === 'index.html') setDraftHtml(val);
        else if (selectedCodeFile === 'styles.css') setDraftCss(val);
        else setDraftJs(val);
      }}
      onSaveAndRun={handleSaveAndRunManual}
    />
  );

  return (
    <div className="workspace-shell">
      {!isFullscreenPreview && (
        <header className="workspace-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }}>
            <button
              type="button"
              className="icon-btn"
              onClick={onNavigateBack}
              aria-label="Back to projects"
            >
              <ArrowLeft size={20} />
            </button>

            <button
              type="button"
              className="workspace-title-btn"
              onClick={() => onRequestRename(project)}
              title="Rename project"
            >
              <span className="workspace-title-text">{project.title}</span>
              <span className="badge font-mono" style={{ flexShrink: 0 }}>
                v{project.version}
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
            {(activeTab === 'preview' || isWideScreen) && (
              <>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => {
                    setConsoleLogs([]);
                    setReloadNonce((n) => n + 1);
                  }}
                  aria-label="Reload live preview"
                  title="Reload preview"
                >
                  <RefreshCw size={19} />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowConsoleSheet(true)}
                  aria-label="View console logs"
                  title="Preview Console"
                >
                  <Terminal size={19} />
                  {consoleLogs.length > 0 && (
                    <span className="console-badge">{consoleLogs.length}</span>
                  )}
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setIsFullscreenPreview((v) => !v)}
                  aria-label="Expand preview fullscreen"
                  title="Fullscreen preview"
                >
                  <Maximize2 size={19} />
                </button>
              </>
            )}

            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowOverflowMenu((v) => !v)}
              aria-label="Project actions"
            >
              <MoreVertical size={20} />
            </button>

            {showOverflowMenu && (
              <div className="dropdown-menu">
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    handleToggleStar();
                  }}
                >
                  <Star
                    size={16}
                    fill={project.isStarred ? 'var(--amber)' : 'none'}
                    style={{ color: project.isStarred ? 'var(--amber)' : 'currentColor' }}
                  />
                  <span>{project.isStarred ? 'Remove from Starred' : 'Add to Starred'}</span>
                </button>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    onRequestRename(project);
                  }}
                >
                  <Edit3 size={16} />
                  <span>Rename Project</span>
                </button>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    handleDownloadHtml();
                  }}
                >
                  <Download size={16} />
                  <span>Download HTML</span>
                </button>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    handleShareHtml();
                  }}
                >
                  <Share2 size={16} />
                  <span>Share HTML</span>
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {!isFullscreenPreview && !isWideScreen && (
        <div className="segmented-bar">
          <div className="segmented-control" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'chat'}
              className={`seg-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => handleSelectTab('chat')}
            >
              <MessageSquare size={16} />
              <span>Chat</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'preview'}
              className={`seg-item ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => handleSelectTab('preview')}
            >
              <Play size={16} />
              <span>Preview</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'code'}
              className={`seg-item ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => handleSelectTab('code')}
            >
              <Code2 size={16} />
              <span>Code</span>
            </button>
          </div>
        </div>
      )}

      {project.irDocument && (
        <section aria-label="IR design controls" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', background: 'var(--surface)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <strong style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '.08em' }}>IR DESIGN CONTROLS</strong>
          <input aria-label="Hero headline" value={irHeadline} onChange={(event) => setIrHeadline(event.target.value)} style={{ minWidth: 160, flex: '1 1 180px', minHeight: 38, borderRadius: 8, border: '1px solid var(--border-soft)', background: 'var(--surface-high)', color: 'var(--text-primary)', padding: '0 10px' }} />
          <button type="button" className="btn-outline" onClick={() => applyIrChange('headline')}>Apply headline</button>
          {project.irDocument.sections.find((section) => section.role === 'hero')?.nodes[0]?.imageAssetId && <button type="button" className="btn-outline" onClick={() => applyIrChange('asset')}>Swap approved image</button>}
          <button type="button" className="btn-outline" onClick={() => applyIrChange('mood')}>Shift hero mood</button>
          <button type="button" className="btn-outline" disabled={(project.irRevisions?.length ?? 0) < 2} onClick={() => applyIrChange('rollback')}>Rollback</button>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{project.irRevisions?.length ?? 0} saved revisions · collection protected</span>
        </section>
      )}
      <div className="workspace-body">
        {isFullscreenPreview ? (
          renderPreview()
        ) : isWideScreen ? (
          <>
            <aside className="workspace-split-chat">
              <BuilderChatPane
                messages={messages}
                promptInput={promptInput}
                isGenerating={isGenerating}
                generationStage={generationStage}
                followUpSuggestions={followUpSuggestions}
                pendingUserPrompt={pendingUserPrompt}
                failedUserPrompt={failedUserPrompt}
                errorMessage={errorMessage}
                onPromptChanged={setPromptInput}
                onSendPrompt={() => handleSendIteration()}
                onTapSuggestion={(s) => handleSendIteration(s)}
                onRetryFailedPrompt={() => {
                  if (failedUserPrompt) handleSendIteration(failedUserPrompt);
                }}
                onDismissError={() => {
                  setErrorMessage(null);
                  setFailedUserPrompt(null);
                }}
              />
            </aside>

            <section className="workspace-split-right">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '8px 14px',
                  borderBottom: '1px solid var(--border-soft)',
                  background: 'var(--surface)',
                }}
              >
                <div className="segmented-control two-col" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab !== 'code'}
                    className={`seg-item ${activeTab !== 'code' ? 'active' : ''}`}
                    onClick={() => handleSelectTab('preview')}
                  >
                    <Play size={15} />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'code'}
                    className={`seg-item ${activeTab === 'code' ? 'active' : ''}`}
                    onClick={() => handleSelectTab('code')}
                  >
                    <Code2 size={15} />
                    <span>Code</span>
                  </button>
                </div>
              </div>
              {activeTab === 'code' ? renderCode() : renderPreview()}
            </section>
          </>
        ) : activeTab === 'chat' ? (
          <BuilderChatPane
            messages={messages}
            promptInput={promptInput}
            isGenerating={isGenerating}
            generationStage={generationStage}
            followUpSuggestions={followUpSuggestions}
            pendingUserPrompt={pendingUserPrompt}
            failedUserPrompt={failedUserPrompt}
            errorMessage={errorMessage}
            onPromptChanged={setPromptInput}
            onSendPrompt={() => handleSendIteration()}
            onTapSuggestion={(s) => handleSendIteration(s)}
            onRetryFailedPrompt={() => {
              if (failedUserPrompt) handleSendIteration(failedUserPrompt);
            }}
            onDismissError={() => {
              setErrorMessage(null);
              setFailedUserPrompt(null);
            }}
            onOpenPreview={() => handleSelectTab('preview')}
          />
        ) : activeTab === 'code' ? (
          renderCode()
        ) : (
          renderPreview()
        )}
      </div>
    </div>
  );
}
