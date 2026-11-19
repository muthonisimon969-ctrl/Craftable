import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Box,
  Code2,
  Download,
  Edit3,
  FileJson,
  Maximize2,
  MessageSquare,
  MoreVertical,
  Play,
  RotateCcw,
  Square,
  Star,
  Terminal,
} from 'lucide-react';
import { BuilderChatPane } from '../components/BuilderChatPane';
import { CodeExplorerPane } from '../components/CodeExplorerPane';
import { CreativePreviewPane } from '../components/CreativePreviewPane';
import { iterateCreativeProject } from '../services/creativeAiService';
import * as storage from '../services/projectStorage';
import type {
  AppProject,
  CodeFileTab,
  ConsoleEntry,
  ProjectMessage,
  WorkspaceTab,
} from '../types/project';
import {
  assembleCreativeStandaloneExport,
  buildCreativeJsonExport,
  loadThreeRuntimeSource,
} from '../utils/creativeBundleAssembler';

interface CreativeWorkspacePageProps {
  projectId: string;
  onNavigateBack: () => void;
  onProjectUpdated: (project: AppProject) => void;
  onRequestRename: (project: AppProject) => void;
}

export function CreativeWorkspacePage({
  projectId,
  onNavigateBack,
  onProjectUpdated,
  onRequestRename,
}: CreativeWorkspacePageProps) {
  const [project, setProject] = useState<AppProject | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('preview');
  const [selectedCodeFile, setSelectedCodeFile] = useState<CodeFileTab>('app.js');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  const [draftHtml, setDraftHtml] = useState('');
  const [draftCss, setDraftCss] = useState('');
  const [draftJs, setDraftJs] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingCode, setIsSavingCode] = useState(false);

  const [isRunning, setIsRunning] = useState(true);
  const [reloadNonce, setReloadNonce] = useState(1);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [showConsoleSheet, setShowConsoleSheet] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const [promptInput, setPromptInput] = useState('');
  const [pendingUserPrompt, setPendingUserPrompt] = useState<string | null>(null);
  const [failedUserPrompt, setFailedUserPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([
    'Add rain particles & car headlights',
    'Increase speed & add scoring combos',
    'Add dynamic day/night sky switcher',
  ]);

  const [isWideScreen, setIsWideScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 900 : false
  );

  useEffect(() => {
    const onResize = () => setIsWideScreen(window.innerWidth >= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
          setHasUnsavedChanges(false);
          setRuntimeError(null);
          setIsRunning(true);
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

  const handleRestartScene = () => {
    setConsoleLogs([]);
    setRuntimeError(null);
    setIsRunning(true);
    setReloadNonce((n) => n + 1);
  };

  const handleRunOrStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setRuntimeError(null);
      setIsRunning(true);
      setReloadNonce((n) => n + 1);
    }
  };

  const handleSendModification = async (overridePrompt?: string) => {
    if (!project || isGenerating) return;
    const prompt = (overridePrompt ?? promptInput).trim();
    if (!prompt) return;

    if (!overridePrompt) setPromptInput('');
    setPendingUserPrompt(prompt);
    setFailedUserPrompt(null);
    setIsGenerating(true);
    setGenerationStage('Connecting to Zuno Creative Studio...');
    setErrorMessage(null);

    try {
      const bundle = await iterateCreativeProject(
        project,
        prompt,
        messages,
        draftHtml,
        draftCss,
        draftJs,
        (stage) => setGenerationStage(stage)
      );

      setGenerationStage(`Deploying v${project.version + 1} to 3D viewport...`);
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
      setRuntimeError(null);
      setConsoleLogs([]);
      setIsRunning(true);
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
        err instanceof Error ? err.message : 'Creative Studio could not update this project.'
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
      setRuntimeError(null);
      setConsoleLogs([]);
      setIsRunning(true);
      setReloadNonce((n) => n + 1);
      setActiveTab('preview');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save 3D scene files.');
    } finally {
      setIsSavingCode(false);
    }
  };

  const handleExportHtml = async () => {
    if (!project) return;
    const inlineRuntime = await loadThreeRuntimeSource();
    const html = assembleCreativeStandaloneExport(
      project.title,
      draftHtml,
      draftCss,
      draftJs,
      inlineRuntime
    );
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'zuno-3d-project';
    a.href = url;
    a.download = `${safe}-3d.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportBundleJson = () => {
    if (!project) return;
    const json = buildCreativeJsonExport({
      ...project,
      htmlCode: draftHtml,
      cssCode: draftCss,
      jsCode: draftJs,
    });
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'zuno-3d-bundle';
    a.href = url;
    a.download = `${safe}-files.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleStar = async () => {
    if (!project) return;
    const updated = await storage.toggleProjectStar(project.id, !project.isStarred);
    if (updated) {
      setProject(updated);
      onProjectUpdated(updated);
    }
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
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Creative project not found.</p>
        <button type="button" className="btn-primary" onClick={onNavigateBack}>
          Back to Creative Studio
        </button>
      </div>
    );
  }

  const renderPreview = () => (
    <CreativePreviewPane
      title={project.title}
      htmlCode={draftHtml}
      cssCode={draftCss}
      jsCode={draftJs}
      isRunning={isRunning}
      reloadNonce={reloadNonce}
      isFullscreen={isFullscreenPreview}
      runtimeError={runtimeError}
      consoleLogs={consoleLogs}
      showConsoleSheet={showConsoleSheet}
      onStart={() => handleRestartScene()}
      onRestart={() => handleRestartScene()}
      onToggleFullscreen={() => setIsFullscreenPreview((v) => !v)}
      onRuntimeError={(msg) => setRuntimeError(msg)}
      onAskAiFixError={(err) => {
        if (!isWideScreen) setActiveTab('chat');
        handleSendModification(`Fix this runtime error in the Three.js scene cleanly: ${err}`);
      }}
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
      jsFileLabel="scene.js"
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
              aria-label="Back to Creative Studio"
            >
              <ArrowLeft size={20} />
            </button>

            <button
              type="button"
              className="workspace-title-btn"
              onClick={() => onRequestRename(project)}
              title="Rename Creative project"
            >
              <Box size={16} style={{ color: 'var(--coral)', flexShrink: 0 }} />
              <span className="workspace-title-text">{project.title}</span>
              <span className="badge font-mono" style={{ flexShrink: 0 }}>
                v{project.version}
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
            {/* Transport controls: Run / Stop / Restart */}
            <button
              type="button"
              className="icon-btn"
              onClick={handleRunOrStop}
              aria-label={isRunning ? 'Stop 3D scene' : 'Run 3D scene'}
              title={isRunning ? 'Stop 3D scene' : 'Run 3D scene'}
              style={{ color: isRunning ? 'var(--rose)' : 'var(--emerald)' }}
            >
              {isRunning ? <Square size={17} /> : <Play size={18} />}
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={handleRestartScene}
              aria-label="Restart 3D scene"
              title="Restart 3D scene"
            >
              <RotateCcw size={18} />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowConsoleSheet(true)}
              aria-label="Creative Studio Console"
              title="Console & Diagnostics"
            >
              <Terminal size={18} />
              {consoleLogs.length > 0 && (
                <span className="console-badge">{consoleLogs.length}</span>
              )}
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setActiveTab('preview');
                setIsFullscreenPreview((v) => !v);
              }}
              aria-label="Fullscreen 3D preview"
              title="Fullscreen 3D preview"
            >
              <Maximize2 size={18} />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowOverflowMenu((v) => !v)}
              aria-label="Export and project actions"
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
                    handleExportHtml();
                  }}
                >
                  <Download size={16} />
                  <span>Export Playable HTML</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    handleExportBundleJson();
                  }}
                >
                  <FileJson size={16} />
                  <span>Export Project Files (.json)</span>
                </button>
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
                  <span>{project.isStarred ? 'Remove Star' : 'Star Project'}</span>
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
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={16} />
              <span>Chat</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'preview'}
              className={`seg-item ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <Play size={16} />
              <span>3D Preview</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'code'}
              className={`seg-item ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <Code2 size={16} />
              <span>Files</span>
            </button>
          </div>
        </div>
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
                assistantLabel="Creative Studio AI"
                placeholder="Modify this 3D scene, add physics, lighting, or obstacles..."
                onPromptChanged={setPromptInput}
                onSendPrompt={() => handleSendModification()}
                onTapSuggestion={(s) => handleSendModification(s)}
                onRetryFailedPrompt={() => {
                  if (failedUserPrompt) handleSendModification(failedUserPrompt);
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
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  borderBottom: '1px solid var(--border-soft)',
                  background: 'var(--surface)',
                }}
              >
                <div className="status-pill" style={{ cursor: 'default' }}>
                  <span className={`status-dot ${isRunning ? '' : 'needs-key'}`} />
                  <span>{isRunning ? 'WebGL Running' : 'Stopped'}</span>
                </div>

                <div className="segmented-control two-col" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab !== 'code'}
                    className={`seg-item ${activeTab !== 'code' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    <Play size={15} />
                    <span>3D Preview</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'code'}
                    className={`seg-item ${activeTab === 'code' ? 'active' : ''}`}
                    onClick={() => setActiveTab('code')}
                  >
                    <Code2 size={15} />
                    <span>Files</span>
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
            assistantLabel="Creative Studio AI"
            placeholder="Modify this 3D scene, add physics, lighting, or obstacles..."
            onPromptChanged={setPromptInput}
            onSendPrompt={() => handleSendModification()}
            onTapSuggestion={(s) => handleSendModification(s)}
            onRetryFailedPrompt={() => {
              if (failedUserPrompt) handleSendModification(failedUserPrompt);
            }}
            onDismissError={() => {
              setErrorMessage(null);
              setFailedUserPrompt(null);
            }}
            onOpenPreview={() => setActiveTab('preview')}
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
