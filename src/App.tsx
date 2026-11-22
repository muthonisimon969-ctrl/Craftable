import { useCallback, useEffect, useState } from 'react';
import { type NavSection } from './components/AppNavigation';
import { DeleteProjectModal, RenameProjectModal } from './components/Modals';
import { AdminPage } from './pages/AdminPage';
import { ChatStudioPage } from './pages/ChatStudioPage';
import { CreativeWorkspacePage } from './pages/CreativeWorkspacePage';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { checkServerAiStatus, generateNewApp } from './services/craftAiService';
import { generateCreativeProject } from './services/creativeAiService';
import * as storage from './services/projectStorage';
import {
  generateAiVisual,
  loadChatHistory,
  loadCreatedImages,
  saveChatHistory,
  saveCreatedImages,
  sendUnifiedChatTurn,
} from './services/unifiedChatService';
import type {
  AppProject,
  ChatThreadMessage,
  CreativeCategory,
  GeneratedVisualAsset,
  PromptAttachment,
  StudioCapability,
  TemplateType,
} from './types/project';

const THEME_STORAGE_KEY = 'zuno_dark_theme';
const LEGACY_THEME_STORAGE_KEY = 'craftable_dark_theme';

type AppRoute =
  | { view: 'home' }
  | { view: 'chat' }
  | { view: 'projects' }
  | { view: 'settings' }
  | { view: 'admin' }
  | { view: 'workspace'; projectId: string }
  | { view: 'creative_workspace'; projectId: string };

function parseRoute(): AppRoute {
  const path = window.location.pathname;
  if (/^\/admin\/?$/.test(path)) return { view: 'admin' };
  if (/^\/chat\/?$/.test(path)) return { view: 'chat' };
  if (/^\/(create|creative|explore)\/?$/.test(path)) return { view: 'home' };
  if (/^\/projects\/?$/.test(path)) return { view: 'projects' };
  if (/^\/settings\/?$/.test(path)) return { view: 'settings' };

  const creativeMatch = /^\/creative\/([^/]+)\/?$/.exec(path);
  if (creativeMatch) {
    return { view: 'creative_workspace', projectId: decodeURIComponent(creativeMatch[1]) };
  }
  const wsMatch = /^\/workspace\/([^/]+)\/?$/.exec(path);
  if (wsMatch) {
    return { view: 'workspace', projectId: decodeURIComponent(wsMatch[1]) };
  }
  return { view: 'home' };
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute());
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      const saved =
        localStorage.getItem(THEME_STORAGE_KEY) ??
        localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [projects, setProjects] = useState<AppProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isServerAiReady, setIsServerAiReady] = useState(true);

  const [homePrompt, setHomePrompt] = useState('');
  const [homeCapability, setHomeCapability] = useState<StudioCapability>('build');
  const [homeAttachments, setHomeAttachments] = useState<PromptAttachment[]>([]);

  const [isBusy, setIsBusy] = useState(false);
  const [busyStatus, setBusyStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatThreadMessage[]>(() => loadChatHistory());
  const [isChatReplying, setIsChatReplying] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [createdImages, setCreatedImages] = useState<GeneratedVisualAsset[]>(() => loadCreatedImages());

  const [projectToRename, setProjectToRename] = useState<AppProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<AppProject | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDarkTheme);
    root.classList.toggle('light', !isDarkTheme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDarkTheme ? '#0B0D14' : '#FBFBFD');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, String(isDarkTheme));
    } catch {
      // Ignore storage error
    }
  }, [isDarkTheme]);

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const refreshServerStatus = useCallback(async () => {
    const st = await checkServerAiStatus();
    setIsServerAiReady(st.ready);
  }, []);

  const refreshProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const list = await storage.listProjects();
      setProjects(list);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
    refreshServerStatus();
  }, [refreshProjects, refreshServerStatus]);

  const pushRoute = (url: string, next: AppRoute) => {
    setErrorMessage(null);
    window.history.pushState({}, '', url);
    setRoute(next);
  };

  const handleNavigateSection = (section: NavSection) => {
    if (section === 'home') {
      pushRoute('/', { view: 'home' });
      refreshProjects();
      refreshServerStatus();
    } else if (section === 'chat') {
      pushRoute('/chat', { view: 'chat' });
    } else if (section === 'projects') {
      pushRoute('/projects', { view: 'projects' });
      refreshProjects();
    } else if (section === 'settings') {
      pushRoute('/settings', { view: 'settings' });
    }
  };

  const upsertProject = (updated: AppProject) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      return exists ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated, ...prev];
    });
  };

  const handleBuildWebApp = async (
    prompt: string,
    templateType: TemplateType = 'web_app',
    attachments: PromptAttachment[] = []
  ) => {
    if (isBusy) return;
    setIsBusy(true);
    setBusyStatus('Connecting to Zuno AI...');
    setErrorMessage(null);

    try {
      const bundle = await generateNewApp(
        prompt,
        templateType,
        null,
        (stage) => setBusyStatus(stage),
        attachments
      );
      setBusyStatus('Saving project...');
      const created = await storage.createProject(prompt, templateType, bundle, {
        mode: 'standard',
      });
      upsertProject(created);
      setIsBusy(false);
      setBusyStatus('');
      setHomePrompt('');
      setHomeAttachments([]);
      pushRoute(`/workspace/${encodeURIComponent(created.id)}`, {
        view: 'workspace',
        projectId: created.id,
      });
    } catch (err) {
      setIsBusy(false);
      setBusyStatus('');
      setErrorMessage(
        err instanceof Error ? err.message : 'Zuno AI did not complete this request.'
      );
    }
  };

  const handleCreate3dProject = async (
    prompt: string,
    category: CreativeCategory = '3d_game',
    attachments: PromptAttachment[] = []
  ) => {
    if (isBusy) return;
    setIsBusy(true);
    setBusyStatus('Connecting to Zuno 3D Studio...');
    setErrorMessage(null);

    try {
      const bundle = await generateCreativeProject(
        prompt,
        category,
        null,
        (stage) => setBusyStatus(stage),
        attachments
      );
      setBusyStatus('Saving 3D experience...');
      const created = await storage.createProject(prompt, 'web_app', bundle, {
        mode: 'creative',
        creativeCategory: category,
      });
      upsertProject(created);
      setIsBusy(false);
      setBusyStatus('');
      setHomePrompt('');
      setHomeAttachments([]);
      pushRoute(`/creative/${encodeURIComponent(created.id)}`, {
        view: 'creative_workspace',
        projectId: created.id,
      });
    } catch (err) {
      setIsBusy(false);
      setBusyStatus('');
      setErrorMessage(
        err instanceof Error ? err.message : '3D Studio could not complete this request.'
      );
    }
  };

  const handleGenerateImage = async (prompt: string, attachments: PromptAttachment[] = []) => {
    if (isBusy) return;
    setIsBusy(true);
    setBusyStatus('Generating image with Zuno AI...');
    setErrorMessage(null);

    try {
      const asset = await generateAiVisual(prompt, attachments);
      const next = [asset, ...createdImages].slice(0, 16);
      setCreatedImages(next);
      saveCreatedImages(next);
      setIsBusy(false);
      setBusyStatus('');
      setHomePrompt('');
      setHomeAttachments([]);
    } catch (err) {
      setIsBusy(false);
      setBusyStatus('');
      setErrorMessage(
        err instanceof Error ? err.message : 'Image creation did not succeed.'
      );
    }
  };

  const handleSendChatTurn = async (text: string, attachments: PromptAttachment[] = []) => {
    if (isChatReplying) return;
    setChatError(null);
    const userMsg: ChatThreadMessage = {
      id: `chat-u-${Date.now()}`,
      role: 'user',
      content: text,
      attachmentNames: attachments.map((a) => a.name),
      createdAtMillis: Date.now(),
    };
    const nextHistory = [...chatMessages, userMsg];
    setChatMessages(nextHistory);
    saveChatHistory(nextHistory);
    setIsChatReplying(true);

    try {
      const { replyText, suggestedBuildPrompt } = await sendUnifiedChatTurn(
        text,
        chatMessages,
        attachments
      );
      const aiMsg: ChatThreadMessage = {
        id: `chat-a-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        suggestedBuildPrompt,
        createdAtMillis: Date.now(),
      };
      const updated = [...nextHistory, aiMsg];
      setChatMessages(updated);
      saveChatHistory(updated);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Zuno Chat failed to reply.');
    } finally {
      setIsChatReplying(false);
    }
  };

  const handleHomeSubmit = async () => {
    const trimmed = homePrompt.trim();
    if (!trimmed) return;
    if (homeCapability === 'chat') {
      const attachments = homeAttachments;
      setHomePrompt('');
      setHomeAttachments([]);
      pushRoute('/chat', { view: 'chat' });
      await handleSendChatTurn(trimmed, attachments);
    } else if (homeCapability === 'create_3d') {
      await handleCreate3dProject(trimmed, '3d_game', homeAttachments);
    } else if (homeCapability === 'image') {
      await handleGenerateImage(trimmed, homeAttachments);
    } else {
      await handleBuildWebApp(trimmed, 'web_app', homeAttachments);
    }
  };

  const handleOpenProject = (project: AppProject) => {
    if (project.mode === 'creative') {
      pushRoute(`/creative/${encodeURIComponent(project.id)}`, {
        view: 'creative_workspace',
        projectId: project.id,
      });
    } else {
      pushRoute(`/workspace/${encodeURIComponent(project.id)}`, {
        view: 'workspace',
        projectId: project.id,
      });
    }
  };

  const handleToggleStar = async (project: AppProject) => {
    const updated = await storage.toggleProjectStar(project.id, !project.isStarred);
    if (updated) upsertProject(updated);
  };

  const handleRenameConfirm = async (projectId: string, title: string, description: string) => {
    const updated = await storage.renameProject(projectId, title, description);
    if (updated) upsertProject(updated);
    setProjectToRename(null);
  };

  const handleDeleteConfirm = async (projectId: string) => {
    await storage.deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setProjectToDelete(null);
  };

  return (
    <>
      {route.view === 'admin' ? (
        <AdminPage
          onNavigateHome={() => handleNavigateSection('settings')}
          onStatusChanged={refreshServerStatus}
        />
      ) : route.view === 'creative_workspace' ? (
        <CreativeWorkspacePage
          key={route.projectId}
          projectId={route.projectId}
          onNavigateBack={() => handleNavigateSection('projects')}
          onProjectUpdated={upsertProject}
          onRequestRename={(proj) => setProjectToRename(proj)}
        />
      ) : route.view === 'workspace' ? (
        <WorkspacePage
          key={route.projectId}
          projectId={route.projectId}
          onNavigateBack={() => handleNavigateSection('projects')}
          onProjectUpdated={upsertProject}
          onRequestRename={(proj) => setProjectToRename(proj)}
        />
      ) : route.view === 'chat' ? (
        <ChatStudioPage
          messages={chatMessages}
          isDarkTheme={isDarkTheme}
          isServerAiReady={isServerAiReady}
          isReplying={isChatReplying}
          isBuilding={isBusy}
          buildStatus={busyStatus}
          errorMessage={chatError ?? errorMessage}
          onNavigate={handleNavigateSection}
          onToggleTheme={() => setIsDarkTheme((v) => !v)}
          onSendMessage={handleSendChatTurn}
          onClearChat={() => {
            setChatMessages([]);
            saveChatHistory([]);
          }}
          onDismissError={() => {
            setChatError(null);
            setErrorMessage(null);
          }}
          onHandOffToBuild={(prompt) => {
            setHomePrompt(prompt);
            setHomeCapability('build');
            handleBuildWebApp(prompt);
          }}
          onHandOffTo3d={(prompt) => {
            setHomePrompt(prompt);
            setHomeCapability('create_3d');
            handleCreate3dProject(prompt);
          }}
        />
      ) : route.view === 'projects' ? (
        <ProjectsPage
          projects={projects}
          isLoadingProjects={isLoadingProjects}
          isDarkTheme={isDarkTheme}
          isServerAiReady={isServerAiReady}
          onNavigate={handleNavigateSection}
          onToggleTheme={() => setIsDarkTheme((v) => !v)}
          onOpenProject={handleOpenProject}
          onToggleStar={handleToggleStar}
          requestRename={(proj) => setProjectToRename(proj)}
          requestDelete={(proj) => setProjectToDelete(proj)}
        />
      ) : route.view === 'settings' ? (
        <SettingsPage
          isDarkTheme={isDarkTheme}
          isServerAiReady={isServerAiReady}
          onNavigate={handleNavigateSection}
          onToggleTheme={() => setIsDarkTheme((v) => !v)}
          onRefreshStatus={refreshServerStatus}
          onOpenAdmin={() => pushRoute('/admin', { view: 'admin' })}
        />
      ) : (
        <HomePage
          isDarkTheme={isDarkTheme}
          isServerAiReady={isServerAiReady}
          isBusy={isBusy}
          busyStatus={busyStatus}
          errorMessage={errorMessage}
          promptText={homePrompt}
          capability={homeCapability}
          attachments={homeAttachments}
          projectCount={projects.length}
          onNavigate={handleNavigateSection}
          onToggleTheme={() => setIsDarkTheme((v) => !v)}
          onPromptChange={setHomePrompt}
          onCapabilityChange={setHomeCapability}
          onAttachmentsChange={setHomeAttachments}
          onSubmitPrompt={handleHomeSubmit}
          onDismissError={() => setErrorMessage(null)}
        />
      )}

      {projectToRename && (
        <RenameProjectModal
          initialTitle={projectToRename.title}
          initialDescription={projectToRename.description}
          onDismiss={() => setProjectToRename(null)}
          onConfirm={(title, desc) =>
            handleRenameConfirm(projectToRename.id, title, desc)
          }
        />
      )}

      {projectToDelete && (
        <DeleteProjectModal
          projectTitle={projectToDelete.title}
          onDismiss={() => setProjectToDelete(null)}
          onConfirm={() => handleDeleteConfirm(projectToDelete.id)}
        />
      )}
    </>
  );
}
