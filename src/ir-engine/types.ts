export type SectionMode = 'editorial' | 'index' | 'product-led';
export type BrandMood = 'quiet-editorial' | 'technical-dark' | 'warm-editorial';

export interface DesignTokens {
  color: { ink: string; paper: string; accent: string; muted: string; line: string; surface: string };
  type: { family: string; display: string; body: string };
  space: { section: number; content: number; tight: number };
  radius: { card: number; image: number };
}

export interface BrandIdentityAnchor {
  id: string;
  name: string;
  mood: BrandMood;
  tokens: DesignTokens;
  createdFromRevisionId: string;
}

export interface ScopedOverride {
  id: string;
  targetId: string;
  field: string;
  overrideReason: string;
  affectedIds: string[];
}

export interface IrNode {
  id: string;
  type: 'hero' | 'collection';
  eyebrow?: string;
  title?: string;
  body?: string;
  imageAssetId?: string;
  alt?: string;
  items?: Array<{ id: string; title: string; detail: string; imageAssetId?: string }>;
  artwork?: 'architecture-lines' | 'audio-rings';
}

export interface IrSection {
  id: string;
  role: 'hero' | 'collection';
  intent: SectionMode;
  moodOverride?: BrandMood;
  tokenOverrides?: Partial<DesignTokens>;
  nodes: IrNode[];
}

export interface ApprovedAsset {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  alt: string;
}

export interface IrDocument {
  brandName: string;
  anchor: BrandIdentityAnchor;
  sections: IrSection[];
  approvedAssets: ApprovedAsset[];
  overrides: ScopedOverride[];
}

export interface IrRevision {
  id: string;
  parentId: string | null;
  label: string;
  kind: 'initial' | 'edit' | 'rollback' | 'full-redesign';
  anchorId: string;
  document: IrDocument;
  createdAt: string;
}

export interface DriftReport {
  tokenDeltas: Array<{ token: string; from: string | number; to: string | number }>;
  sectionFlips: Array<{ sectionId: string; from: SectionMode; to: SectionMode }>;
  activeOverrides: ScopedOverride[];
}
