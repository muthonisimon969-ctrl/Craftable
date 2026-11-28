import { useCallback, useEffect, useRef, useState } from 'react';
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
import { reviewRenderedWebsite } from '../services/visualIntelligence';

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
  const [visualReviewStatus, setVisualReviewStatus] = useState('Waiting for preview');
  const visualReviewInFlight = useRef(false);
  const visualRepairAttempted = useRef(false);
  const lastReviewedVersion = useRef<number | null>(null);
  const [isWideScreen, setIsWideScreen] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px)');
    const update = () => setIsWideScreen(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
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

  const handlePreviewReady = useCallback(async (frame: HTMLIFrameElement) => {
    if (!project || visualReviewInFlight.current || lastReviewedVersion.current === project.version) return;
    visualReviewInFlight.current = true;
    lastReviewedVersion.current = project.version;
    setVisualReviewStatus('Inspecting desktop + mobile…');
    try {
      const result = await reviewRenderedWebsite(
        frame,
        project.title,
        project.initialPrompt,
        consoleLogs.filter((entry) => entry.level === 'ERROR').map((entry) => entry.message)
      );
      setVisualReviewStatus(`${result.score}/100 · ${result.verdict.replace(/_/g, ' ')}`);
      appendConsoleLog(
        result.verdict === 'ready' ? 'LOG' : result.verdict === 'needs_repair' ? 'ERROR' : 'WARN',
        `Visual Intelligence: ${result.score}/100 — ${result.summary}`
      );
      result.findings.forEach((finding) => {
        appendConsoleLog(
          finding.severity === 'blocker' || finding.severity === 'high' ? 'ERROR' : 'WARN',
          `Visual QA [${finding.severity}] ${finding.area}: ${finding.problem} Fix: ${finding.recommendation}`
        );
      });
      result.responsiveConcerns.forEach((concern) => appendConsoleLog('WARN', `Responsive QA: ${concern}`));
      const severeFindings = result.findings.filter((finding) =>
        finding.severity === 'blocker' || finding.severity === 'high'
      );
      if (result.verdict === 'needs_repair' && severeFindings.length > 0 && !visualRepairAttempted.current) {
        visualRepairAttempted.current = true;
        setVisualReviewStatus('Repairing visible defects…');
        setIsGenerating(true);
        setGenerationStage('Zuno is repairing what the visual review found…');
        try {
          const repairPrompt = [
            'Make one focused repair pass on this existing website using the visual QA findings below.',
            'Preserve the current brand identity, art direction, content, approved images, and all working functionality.',
            'Do not rebuild the site or add unrelated features. Fix only the clearly visible high-severity defects.',
            ...severeFindings.map((finding) => `- ${finding.area}: ${finding.problem}. Recommended fix: ${finding.recommendation}`),
          ].join('\\n');
          const repairedBundle = await iterateExistingApp(
            project,
            repairPrompt,
            messages,
            draftHtml,
            draftCss,
            draftJs,
            (stage) => setGenerationStage(stage)
          );
          const hasCodeChanges =
            repairedBundle.htmlCode !== draftHtml ||
            repairedBundle.cssCode !== draftCss ||
            repairedBundle.jsCode !== draftJs;
          if (hasCodeChanges) {
            const saved = await storage.applyIterationTurn(
              project.id,
              'Visual Intelligence repair: ' + severeFindings.map((finding) => finding.area).join(', '),
              project.version,
              repairedBundle
            );
            setProject(saved.project);
            setMessages(saved.messages);
            onProjectUpdated(saved.project);
            setDraftHtml(saved.project.htmlCode);
            setDraftCss(saved.project.cssCode);
            setDraftJs(saved.project.jsCode);
            setHasUnsavedChanges(false);
            setFollowUpSuggestions(repairedBundle.followUpSuggestions);
            setReloadNonce((value) => value + 1);
            setVisualReviewStatus('Repair applied · rechecking…');
            appendConsoleLog('LOG', 'Visual Intelligence applied one focused repair. The updated preview will be inspected again.');
          } else {
            appendConsoleLog('WARN', 'Visual Intelligence found defects, but the repair pass did not produce a code change. No project files were altered.');
          }
        } catch (repairError) {
          appendConsoleLog('WARN', repairError instanceof Error ? repairError.message : 'Automatic visual repair could not be completed.');
        } finally {
          setIsGenerating(false);
          setGenerationStage('');
        }
      }
    } catch (err) {
      lastReviewedVersion.current = null;
      setVisualReviewStatus('Inspection unavailable');
      appendConsoleLog('WARN', err instanceof Error ? err.message : 'Visual inspection failed.');
    } finally {
      visualReviewInFlight.current = false;
    }
  }, [project, consoleLogs, messages, draftHtml, draftCss, draftJs, appendConsoleLog, onProjectUpdated]);

  useEffect(() => {
    setVisualReviewStatus('Waiting for preview');
    visualReviewInFlight.current = false;
    visualRepairAttempted.current = false;
    lastReviewedVersion.current = null;
  }, [projectId]);

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
      onPreviewReady={handlePreviewReady}
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
              <span className="badge font-mono" style={{ flexShrink: 0, maxWidth: 142, overflow: 'hidden', textOverflow: 'ellipsis' }} title="Rendered desktop and mobile visual review">
                {visualReviewStatus}
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
