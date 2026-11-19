export type TemplateType = 'web_app' | 'dashboard' | 'landing_page' | 'utility';

export type ProjectMode = 'standard' | 'creative';
export type CreativeCategory = '3d_game' | '3d_environment' | 'animation' | 'web_app';

export interface CreativeCategoryMeta {
  id: CreativeCategory;
  displayName: string;
}

export const CREATIVE_CATEGORIES: CreativeCategoryMeta[] = [
  { id: '3d_game', displayName: '3D Game' },
  { id: '3d_environment', displayName: '3D Environment' },
  { id: 'animation', displayName: '2D / 3D Animation' },
  { id: 'web_app', displayName: 'Interactive 3D App' },
];

export function getCreativeCategoryDisplayName(cat?: string): string {
  return CREATIVE_CATEGORIES.find((c) => c.id === cat)?.displayName ?? '3D Studio';
}

export interface TemplateTypeMeta {
  id: TemplateType;
  displayName: string;
}

export const TEMPLATE_TYPES: TemplateTypeMeta[] = [
  { id: 'web_app', displayName: 'Web App' },
  { id: 'dashboard', displayName: 'Dashboard' },
  { id: 'landing_page', displayName: 'Landing Page' },
  { id: 'utility', displayName: 'Utility Tool' },
];

export function getTemplateDisplayName(type: string): string {
  return TEMPLATE_TYPES.find((t) => t.id === type)?.displayName ?? 'Web App';
}

export interface AppProject {
  id: string;
  title: string;
  description: string;
  initialPrompt: string;
  templateType: TemplateType;
  mode?: ProjectMode;
  creativeCategory?: CreativeCategory;
  isStarred: boolean;
  version: number;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  createdAtMillis: number;
  updatedAtMillis: number;
}

export interface ProjectMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  filesChanged: string[];
  versionTag: number;
  createdAtMillis: number;
}

export interface GeneratedAppBundle {
  projectTitle: string;
  description: string;
  summary: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  changedFiles: string[];
  followUpSuggestions: string[];
  designStrategy?: string;
  templateId?: string;
  designDirection?: string;
  qaSummary?: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  badgeLabel: string;
  shortSummary: string;
  industries: string[];
  visualDirection: string;
  colorSystem: string;
  typographyPairing: string;
  layoutBlueprint: string;
  interactivePatterns: string;
  starterPrompt: string;
  defaultTemplateType: TemplateType;
  canvasHex: string;
  surfaceHex: string;
  accentHex: string;
}

export type WorkspaceTab = 'chat' | 'preview' | 'code';
export type CodeFileTab = 'index.html' | 'styles.css' | 'app.js';

export interface ConsoleEntry {
  id: string;
  level: 'LOG' | 'WARN' | 'ERROR';
  message: string;
  timestampMs: number;
}
