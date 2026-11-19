import { useCallback, useEffect, useState } from 'react';
import {
  DeleteProjectModal,
  RenameProjectModal,
} from './components/Modals';
import type { CreativeBlueprint } from './data/creativeBlueprints';
import { buildCreativeStarterBundle } from './data/creativeStarters';
import { buildStarterTemplateBundle } from './data/starterTemplateBundles';
import { AdminPage } from './pages/AdminPage';
import { CreativeHubPage } from './pages/CreativeHubPage';
import { CreativeWorkspacePage } from './pages/CreativeWorkspacePage';
import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';
import {
  checkServerAiStatus,
  generateNewApp,
} from './services/craftAiService';
import { generateCreativeProject } from './services/creativeAiService';
import * as storage from './services/projectStorage';
import type {
  AppProject,
  CreativeCategory,
  DesignTemplate,
  TemplateType,
} from './types/project';

const THEME_STORAGE_KEY = 'zuno_dark_theme';
const LEGACY_THEME_STORAGE_KEY = 'craftable_dark_theme';

type AppRoute =
  | { view: 'home' }
  | { view: 'admin' }
  | { view: 'workspace'; projectId: string }
  | { view: 'creative' }
  | { view: 'creative_workspace'; projectId: string };

function parseRoute(): AppRoute {
  const path = window.location.pathname;
  if (/^\/admin\/?$/.test(path)) {
    return { view: 'admin' };
  }
  const creativeMatch = /^\/creative\/([^/]+)\/?$/.exec(path);
  if (creativeMatch) {
    return { view: 'creative_workspace', projectId: decodeURIComponent(creativeMatch[1]) };
  }
  if (/^\/creative\/?$/.test(path)) {
    return { view: 'creative' };
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

  const navigateToCreativeWorkspace = (projectId: string) => {
    window.history.pushState({}, '', `/creative/${encodeURIComponent(projectId)}`);
    setRoute({ view: 'creative_workspace', projectId });
  };

  const navigateCreativeHub = () => {
    setErrorMessage(null);
    window.history.pushState({}, '', '/creative');
    setRoute({ view: 'creative' });
    refreshProjects();
    refreshServerStatus();
  };

  const navigateHome = () => {
    setErrorMessage(null);
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
      const created = await storage.createProject(prompt, templateType, bundle, {
        mode: 'standard',
      });
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
        bundle,
        { mode: 'standard' }
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

  const handleCreateCreativeWithAi = async (
    prompt: string,
    category: CreativeCategory,
    blueprint: CreativeBlueprint | null
  ) => {
    if (isBuilding) return;
    setIsBuilding(true);
    setBuildStatus('Connecting to Zuno Creative Studio...');
    setErrorMessage(null);

    try {
      const bundle = await generateCreativeProject(
        prompt,
        category,
        blueprint?.blueprintHint ?? null,
        (stage) => setBuildStatus(stage)
      );
      setBuildStatus('Saving 3D Creative project...');
      const created = await storage.createProject(prompt, 'web_app', bundle, {
        mode: 'creative',
        creativeCategory: category,
      });
      setProjects((prev) => [created, ...prev]);
      setIsBuilding(false);
      setBuildStatus('');
      navigateToCreativeWorkspace(created.id);
    } catch (err) {
      setIsBuilding(false);
      setBuildStatus('');
      setErrorMessage(
        err instanceof Error ? err.message : 'Creative Studio did not complete this request.'
      );
    }
  };

  const handleLaunchCreativeStarter = async (blueprint: CreativeBlueprint) => {
    if (isBuilding) return;
    setIsBuilding(true);
    setBuildStatus(`Launching ${blueprint.name}...`);
    setErrorMessage(null);

    try {
      const bundle = buildCreativeStarterBundle(blueprint.id);
      const created = await storage.createProject(
        blueprint.starterPrompt,
        'web_app',
        bundle,
        {
          mode: 'creative',
          creativeCategory: blueprint.category,
        }
      );
      setProjects((prev) => [created, ...prev]);
      setIsBuilding(false);
      setBuildStatus('');
      navigateToCreativeWorkspace(created.id);
    } catch (err) {
      setIsBuilding(false);
      setBuildStatus('');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to launch 3D starter.');
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

  const standardProjects = projects.filter((p) => p.mode !== 'creative');
  const creativeProjects = projects.filter((p) => p.mode === 'creative');

  const upsertProject = (updated: AppProject) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      return exists ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated, ...prev];
    });
  };

  return (
    <>
      {route.view === 'admin' ? (
        <AdminPage
          onNavigateHome={navigateHome}
          onStatusChanged={refreshServerStatus}
        />
      ) : route.view === 'creative_workspace' ? (
        <CreativeWorkspacePage
          key={route.projectId}
          projectId={route.projectId}
          onNavigateBack={navigateCreativeHub}
          onProjectUpdated={upsertProject}
          onRequestRename={(proj) => setProjectToRename(proj)}
        />
      ) : route.view === 'creative' ? (
        <CreativeHubPage
          projects={creativeProjects}
          isLoadingProjects={isLoadingProjects}
          isDarkTheme={isDarkTheme}
          isServerAiReady={isServerAiReady}
          isBuilding={isBuilding}
          buildStatus={buildStatus}
          errorMessage={errorMessage}
          onNavigateHome={navigateHome}
          onOpenAdmin={navigateAdmin}
          onToggleTheme={() => setIsDarkTheme((v) => !v)}
          onCreateWithAi={handleCreateCreativeWithAi}
          onLaunchBlueprintStarter={handleLaunchCreativeStarter}
          onOpenCreativeProject={navigateToCreativeWorkspace}
          onToggleStar={handleToggleStar}
          onDismissError={() => setErrorMessage(null)}
          requestRename={(proj) => setProjectToRename(proj)}
          requestDelete={(proj) => setProjectToDelete(proj)}
        />
      ) : route.view === 'workspace' ? (
        <WorkspacePage
          key={route.projectId}
          projectId={route.projectId}
          onNavigateBack={navigateHome}
          onProjectUpdated={upsertProject}
          onRequestRename={(proj) => setProjectToRename(proj)}
        />
      ) : (
        <HomePage
          projects={standardProjects}
          isLoadingProjects={isLoadingProjects}
          isDarkTheme={isDarkTheme}
          isServerAiReady={isServerAiReady}
          isBuilding={isBuilding}
          buildStatus={buildStatus}
          errorMessage={errorMessage}
          onToggleTheme={() => setIsDarkTheme((v) => !v)}
          onOpenAdmin={navigateAdmin}
          onOpenCreativeStudio={navigateCreativeHub}
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
