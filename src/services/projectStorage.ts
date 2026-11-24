import type {
  AppProject,
  CreativeCategory,
  GeneratedAppBundle,
  ProjectMessage,
  ProjectMode,
  TemplateType,
} from '../types/project';
import type { IrDocument, IrRevision } from '../ir-engine/types';

const DB_NAME = 'craftable_studio_db';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const MESSAGES_STORE = 'messages';
const FALLBACK_PROJECTS_KEY = 'craftable_projects_v1';
const FALLBACK_MESSAGES_KEY = 'craftable_messages_v1';

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
        const msgStore = db.createObjectStore(MESSAGES_STORE, { keyPath: 'id' });
        msgStore.createIndex('projectId', 'projectId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

function readFallbackProjects(): AppProject[] {
  try {
    const raw = localStorage.getItem(FALLBACK_PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as AppProject[]) : [];
  } catch {
    return [];
  }
}

function writeFallbackProjects(projects: AppProject[]): void {
  localStorage.setItem(FALLBACK_PROJECTS_KEY, JSON.stringify(projects));
}

function readFallbackMessages(): ProjectMessage[] {
  try {
    const raw = localStorage.getItem(FALLBACK_MESSAGES_KEY);
    return raw ? (JSON.parse(raw) as ProjectMessage[]) : [];
  } catch {
    return [];
  }
}

function writeFallbackMessages(messages: ProjectMessage[]): void {
  localStorage.setItem(FALLBACK_MESSAGES_KEY, JSON.stringify(messages));
}

export async function listProjects(): Promise<AppProject[]> {
  try {
    const db = await openDatabase();
    return await new Promise<AppProject[]>((resolve, reject) => {
      const tx = db.transaction(PROJECTS_STORE, 'readonly');
      const store = tx.objectStore(PROJECTS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result as AppProject[]).sort((a, b) => b.updatedAtMillis - a.updatedAtMillis);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return readFallbackProjects().sort((a, b) => b.updatedAtMillis - a.updatedAtMillis);
  }
}

export async function listStandardProjects(): Promise<AppProject[]> {
  const all = await listProjects();
  return all.filter((p) => p.mode !== 'creative');
}

export async function listCreativeProjects(): Promise<AppProject[]> {
  const all = await listProjects();
  return all.filter((p) => p.mode === 'creative');
}

export async function getProject(projectId: string): Promise<AppProject | null> {
  try {
    const db = await openDatabase();
    return await new Promise<AppProject | null>((resolve, reject) => {
      const tx = db.transaction(PROJECTS_STORE, 'readonly');
      const req = tx.objectStore(PROJECTS_STORE).get(projectId);
      req.onsuccess = () => resolve((req.result as AppProject | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return readFallbackProjects().find((p) => p.id === projectId) ?? null;
  }
}

export async function listMessages(projectId: string): Promise<ProjectMessage[]> {
  try {
    const db = await openDatabase();
    return await new Promise<ProjectMessage[]>((resolve, reject) => {
      const tx = db.transaction(MESSAGES_STORE, 'readonly');
      const index = tx.objectStore(MESSAGES_STORE).index('projectId');
      const req = index.getAll(projectId);
      req.onsuccess = () => {
        const msgs = (req.result as ProjectMessage[]).sort(
          (a, b) => a.createdAtMillis - b.createdAtMillis
        );
        resolve(msgs);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return readFallbackMessages()
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => a.createdAtMillis - b.createdAtMillis);
  }
}

async function putProjectAndMessages(project: AppProject, messages: ProjectMessage[]): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([PROJECTS_STORE, MESSAGES_STORE], 'readwrite');
      tx.objectStore(PROJECTS_STORE).put(project);
      const msgStore = tx.objectStore(MESSAGES_STORE);
      messages.forEach((m) => msgStore.put(m));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const existingProjects = readFallbackProjects().filter((p) => p.id !== project.id);
    writeFallbackProjects([project, ...existingProjects]);
    const existingMessages = readFallbackMessages();
    writeFallbackMessages([...existingMessages, ...messages]);
  }
}

export async function createProject(
  prompt: string,
  templateType: TemplateType,
  bundle: GeneratedAppBundle,
  options?: { mode?: ProjectMode; creativeCategory?: CreativeCategory; irDocument?: IrDocument; irRevisions?: IrRevision[] }
): Promise<AppProject> {
  const projectId = createId();
  const now = Date.now();
  const project: AppProject = {
    id: projectId,
    title: bundle.projectTitle.trim().slice(0, 120) || 'Untitled Project',
    description: bundle.description.trim().slice(0, 500),
    initialPrompt: prompt.trim().slice(0, 2000),
    templateType,
    ...(options?.mode ? { mode: options.mode } : {}),
    ...(options?.creativeCategory ? { creativeCategory: options.creativeCategory } : {}),
    isStarred: false,
    version: 1,
    htmlCode: bundle.htmlCode,
    cssCode: bundle.cssCode,
    jsCode: bundle.jsCode,
    ...(options?.irDocument ? {
      irSchemaVersion: 1 as const,
      irDocument: options.irDocument,
      irRevisions: (options.irRevisions ?? []).slice(-20),
      irManagedSectionIds: options.irDocument.sections.map((section) => section.id),
    } : {}),
    createdAtMillis: now,
    updatedAtMillis: now,
  };

  const messages: ProjectMessage[] = [
    {
      id: createId(),
      projectId,
      role: 'user',
      content: prompt.trim(),
      filesChanged: [],
      versionTag: 1,
      createdAtMillis: now,
    },
    {
      id: createId(),
      projectId,
      role: 'assistant',
      content: bundle.summary.trim() || 'Generated initial app.',
      filesChanged: bundle.changedFiles,
      versionTag: 1,
      createdAtMillis: now + 1,
    },
  ];

  await putProjectAndMessages(project, messages);
  return project;
}

export async function applyIterationTurn(
  projectId: string,
  prompt: string,
  currentVersion: number,
  bundle: GeneratedAppBundle
): Promise<{ project: AppProject; messages: ProjectMessage[] }> {
  const existing = await getProject(projectId);
  if (!existing) throw new Error('Project not found.');
  if (existing.irDocument) {
    throw new Error('This project is IR-managed. Use a scoped design edit so its structured source and revision history stay in sync.');
  }

  const nextVersion = currentVersion + 1;
  const now = Date.now();
  const updated: AppProject = {
    ...existing,
    title: bundle.projectTitle.trim().slice(0, 120) || existing.title,
    description: bundle.description.trim().slice(0, 500) || existing.description,
    version: nextVersion,
    htmlCode: bundle.htmlCode,
    cssCode: bundle.cssCode,
    jsCode: bundle.jsCode,
    updatedAtMillis: now,
  };

  const newMessages: ProjectMessage[] = [
    {
      id: createId(),
      projectId,
      role: 'user',
      content: prompt.trim(),
      filesChanged: [],
      versionTag: nextVersion,
      createdAtMillis: now,
    },
    {
      id: createId(),
      projectId,
      role: 'assistant',
      content: bundle.summary.trim() || 'Updated application.',
      filesChanged: bundle.changedFiles,
      versionTag: nextVersion,
      createdAtMillis: now + 1,
    },
  ];

  await putProjectAndMessages(updated, newMessages);
  const allMessages = await listMessages(projectId);
  return { project: updated, messages: allMessages };
}

export async function updateProjectCodeManual(
  projectId: string,
  currentVersion: number,
  htmlCode: string,
  cssCode: string,
  jsCode: string
): Promise<AppProject> {
  const existing = await getProject(projectId);
  if (!existing) throw new Error('Project not found.');
  if (existing.irDocument) {
    throw new Error('Manual whole-file code saving is disabled for IR-managed projects. Apply a scoped IR edit instead.');
  }
  const updated: AppProject = {
    ...existing,
    version: currentVersion + 1,
    htmlCode,
    cssCode,
    jsCode,
    updatedAtMillis: Date.now(),
  };
  await putProjectAndMessages(updated, []);
  return updated;
}

export async function saveIrProjectState(
  projectId: string,
  currentVersion: number,
  irDocument: IrDocument,
  irRevisions: IrRevision[],
  htmlCode: string,
  cssCode: string,
  jsCode = ''
): Promise<AppProject> {
  const existing = await getProject(projectId);
  if (!existing) throw new Error('Project not found.');
  if (!existing.irDocument) throw new Error('This project is not IR-managed.');
  const updated: AppProject = {
    ...existing,
    irSchemaVersion: 1,
    irDocument,
    irRevisions: irRevisions.slice(-20),
    irManagedSectionIds: irDocument.sections.map((section) => section.id),
    version: currentVersion + 1,
    htmlCode,
    cssCode,
    jsCode,
    updatedAtMillis: Date.now(),
  };
  await putProjectAndMessages(updated, []);
  return updated;
}

export async function toggleProjectStar(projectId: string, isStarred: boolean): Promise<AppProject | null> {
  const existing = await getProject(projectId);
  if (!existing) return null;
  const updated: AppProject = {
    ...existing,
    isStarred,
    updatedAtMillis: Date.now(),
  };
  await putProjectAndMessages(updated, []);
  return updated;
}

export async function renameProject(
  projectId: string,
  newTitle: string,
  newDescription: string
): Promise<AppProject | null> {
  const existing = await getProject(projectId);
  if (!existing) return null;
  const updated: AppProject = {
    ...existing,
    title: newTitle.trim().slice(0, 120) || 'Untitled Craft',
    description: newDescription.trim().slice(0, 500),
    updatedAtMillis: Date.now(),
  };
  await putProjectAndMessages(updated, []);
  return updated;
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([PROJECTS_STORE, MESSAGES_STORE], 'readwrite');
      tx.objectStore(PROJECTS_STORE).delete(projectId);
      const msgStore = tx.objectStore(MESSAGES_STORE);
      const idx = msgStore.index('projectId');
      const keysReq = idx.getAllKeys(projectId);
      keysReq.onsuccess = () => {
        (keysReq.result as IDBValidKey[]).forEach((key) => msgStore.delete(key));
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    writeFallbackProjects(readFallbackProjects().filter((p) => p.id !== projectId));
    writeFallbackMessages(readFallbackMessages().filter((m) => m.projectId !== projectId));
  }
}
