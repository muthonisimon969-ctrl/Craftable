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

      if (
        bundle.changedFiles.length === 0 &&
        bundle.htmlCode === draftHtml &&
        bundle.cssCode === draftCss &&
        bundle.jsCode === draftJs &&
        bundle.projectTitle === project.title &&
        bundle.description === project.description
      ) {
        const updatedMsgs = await storage.appendProjectConversationTurn(project.id, prompt, bundle.summary);
        setMessages(updatedMsgs);
        setPendingUserPrompt(null);
        setIsGenerating(false);
        setGenerationStage('');
        return;
      }

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
