import { useCallback, useEffect, useState } from 'react';
import {
  CraftAiKeyModal,
  DeleteProjectModal,
  RenameProjectModal,
} from './components/Modals';
import { buildStarterTemplateBundle } from './data/starterTemplateBundles';
import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';
import {
  generateNewApp,
  getSavedUserApiKey,
  saveUserApiKey,
} from './services/craftAiService';
import * as storage from './services/projectStorage';
import type { AppProject, DesignTemplate, TemplateType } from './types/project';

const THEME_STORAGE_KEY = 'craftable_dark_theme';

function getRouteProjectId(): string | null {
  const path = window.location.pathname;
  const match = /^\/workspace\/([^/]+)\/?$/.exec(path);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() =>
    getRouteProjectId()
  );
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [projects, setProjects] = useState<AppProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [personalKey, setPersonalKey] = useState(() => getSavedUserApiKey());
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);
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
    const onPopState = () => setActiveProjectId(getRouteProjectId());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
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
  }, [refreshProjects]);

  const navigateToProject = (projectId: string) => {
    window.history.pushState({}, '', `/workspace/${encodeURIComponent(projectId)}`);
    setActiveProjectId(projectId);
  };

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    setActiveProjectId(null);
    refreshProjects();
  };

  const handleCraftApp = async (prompt: string, templateType: TemplateType) => {
    if (isBuilding) return;
    setIsBuilding(true);
    setBuildStatus('Connecting to Craft AI...');
    setErrorMessage(null);

    try {
      const bundle = await generateNewApp(prompt, templateType, (stage) =>
        setBuildStatus(stage)
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
        err instanceof Error ? err.message : 'Craft AI did not complete this request.'
      );
    }
  };

  const handleLaunchTemplate = async (template: DesignTemplate) => {
    if (isBuilding) return;
    setIsBuilding(true);
    setBuildStatus(`Opening ${template.name} template...`);
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
      setErrorMessage(err instanceof Error ? err.message : 'Failed to open template.');
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
      {activeProjectId ? (
        <WorkspacePage
          key={activeProjectId}
          projectId={activeProjectId}
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
          hasPersonalApiKey={Boolean(personalKey)}
          isBuilding={isBuilding}
          buildStatus={buildStatus}
          errorMessage={errorMessage}
          onToggleTheme={() => setIsDarkTheme((v) => !v)}
          onOpenAiSettings={() => setShowAiKeyModal(true)}
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

      {showAiKeyModal && (
        <CraftAiKeyModal
          currentKey={personalKey}
          onDismiss={() => setShowAiKeyModal(false)}
          onSaveKey={(key) => {
            saveUserApiKey(key);
            setPersonalKey(getSavedUserApiKey());
          }}
        />
      )}
    </>
  );
}
