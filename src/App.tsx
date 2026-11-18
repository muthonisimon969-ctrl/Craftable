import { useCallback, useEffect, useState } from 'react';
import {
  DeleteProjectModal,
  RenameProjectModal,
} from './components/Modals';
import { buildStarterTemplateBundle } from './data/starterTemplateBundles';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';
import {
  checkServerAiStatus,
  generateNewApp,
} from './services/craftAiService';
import * as storage from './services/projectStorage';
import type { AppProject, DesignTemplate, TemplateType } from './types/project';

const THEME_STORAGE_KEY = 'zuno_dark_theme';
const LEGACY_THEME_STORAGE_KEY = 'craftable_dark_theme';

type AppRoute =
  | { view: 'home' }
  | { view: 'admin' }
  | { view: 'workspace'; projectId: string };

function parseRoute(): AppRoute {
  const path = window.location.pathname;
  if (/^\/admin\/?$/.test(path)) {
    return { view: 'admin' };
  }
  const match = /^\/workspace\/([^/]+)\/?$/.exec(path);
  if (match) {
    return { view: 'workspace', projectId: decodeURIComponent(match[1]) };
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
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const navigateToProject = (projectId: string) => {
    window.history.pushState({}, '', `/workspace/${encodeURIComponent(projectId)}`);
    setRoute({ view: 'workspace', projectId });
  };

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    setRoute({ view: 'home' });
    refreshProjects();
    refreshServerStatus();
  };

  const navigateAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setRoute({ view: 'admin' });
  };

  const handleCraftApp = async (
    prompt: string,
    templateType: TemplateType,
    blueprintTemplate: DesignTemplate | null
  ) => {
    if (isBuilding) return;
    setIsBuilding(true);
    setBuildStatus('Connecting to Zuno AI...');
    setErrorMessage(null);

    try {
      const bundle = await generateNewApp(
        prompt,
        templateType,
        blueprintTemplate,
        (stage) => setBuildStatus(stage)
      );
      setBuildStatus('Saving project locally...');
      const created = await storage.createProject(prompt, templateType, bundle);
      setProjects((prev) => [created, ...prev]);
      setIsBuilding(false);
      setBuildStatus('');
      navigateToProject(created.id);
    } catch (err) {
      setIsBuilding(false);
      setBuildStatus('');
      setErrorMessage(
        err instanceof Error ? err.message : 'Zuno AI did not complete this request.'
      );
    }
  };

  const handleLaunchTemplate = async (template: DesignTemplate) => {
    if (isBuilding) return;
    setIsBuilding(true);
    setBuildStatus(`Opening ${template.name} starter...`);
    setErrorMessage(null);

    try {
      const bundle = buildStarterTemplateBundle(template.id);
      const created = await storage.createProject(
        template.starterPrompt,
        template.defaultTemplateType,
        bundle
      );
      setProjects((prev) => [created, ...prev]);
      setIsBuilding(false);
      setBuildStatus('');
      navigateToProject(created.id);
    } catch (err) {
      setIsBuilding(false);
      setBuildStatus('');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to open starter.');
    }
  };

  const handleToggleStar = async (project: AppProject) => {
    const updated = await storage.toggleProjectStar(project.id, !project.isStarred);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleRenameConfirm = async (projectId: string, title: string, description: string) => {
    const updated = await storage.renameProject(projectId, title, description);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
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
          onNavigateHome={navigateHome}
          onStatusChanged={refreshServerStatus}
        />
      ) : route.view === 'workspace' ? (
        <WorkspacePage
          key={route.projectId}
          projectId={route.projectId}
          onNavigateBack={navigateHome}
          onProjectUpdated={(updated) => {
            setProjects((prev) => {
              const exists = prev.some((p) => p.id === updated.id);
              return exists
                ? prev.map((p) => (p.id === updated.id ? updated : p))
                : [updated, ...prev];
            });
          }}
          onRequestRename={(proj) => setProjectToRename(proj)}
        />
      ) : (
        <HomePage
          projects={projects}
          isLoadingProjects={isLoadingProjects}
          isDarkTheme={isDarkTheme}
          isServerAiReady={isServerAiReady}
          isBuilding={isBuilding}
          buildStatus={buildStatus}
          errorMessage={errorMessage}
          onToggleTheme={() => setIsDarkTheme((v) => !v)}
          onOpenAdmin={navigateAdmin}
          onCraftApp={handleCraftApp}
          onLaunchTemplate={handleLaunchTemplate}
          onOpenProject={navigateToProject}
          onToggleStar={handleToggleStar}
          onDismissError={() => setErrorMessage(null)}
          requestRename={(proj) => setProjectToRename(proj)}
          requestDelete={(proj) => setProjectToDelete(proj)}
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
