export type SectionMode = 'editorial' | 'index' | 'product-led';
export type BrandMood = 'quiet-editorial' | 'technical-dark' | 'warm-editorial';
export type PageIntent = 'home' | 'launch' | 'services' | 'projects' | 'about' | 'product' | 'contact' | 'other';
export type HeroLayout = 'type-led' | 'editorial-split' | 'product-led';
export type CollectionLayout = 'index-list' | 'editorial-grid' | 'product-grid';

export interface BrandCompositionRules {
  allowedHeroLayouts: HeroLayout[];
  allowedCollectionLayouts: CollectionLayout[];
  forbiddenPatterns: string[];
  tensionBudget: { min: number; max: number; recommended: number };
}

export interface DesignTokens {
  color: { ink: string; paper: string; accent: string; muted: string; line: string; surface: string };
  type: { family: string; display: number; body: number };
  space: { section: number; content: number; tight: number };
  radius: { card: number; image: number };
}

export type LayoutIntent = 'editorial' | 'dense' | 'shoppable' | 'trust';

export interface AnchorDesignContract {
  layoutIntent: { primary: LayoutIntent; secondary: LayoutIntent };
  spacing: {
    scale: number[];
    contentWidth: number;
    mobileScale: number;
    heroTopException?: { value: number; reason: string };
  };
  typography: {
    displayFamily?: string;
    bodyFamily?: string;
    display: number;
    heading: number;
    body: number;
    label: number;
    lineHeight: { display: number; heading: number; body: number; label: number };
    labelLetterSpacing: number;
    labelUppercase: boolean;
  };
  palette: {
    dominant: string;
    supporting: string;
    ink: string;
    accent: string;
    gradient: 'none' | 'subtle-depth';
    gradientReason?: string;
  };
  restraint: {
    maxColors: number;
    maxTypefaces: number;
    maxShadowStyles: number;
    maxRadiusSystems: number;
  };
  exceptions: Array<{ rule: string; scope: string; reason: string }>;
}

export interface BrandIdentityAnchor {
  id: string;
  name: string;
  mood: BrandMood;
  tokens: DesignTokens;
  createdFromRevisionId: string;
  compositionRules?: BrandCompositionRules;
  /** Optional additive contract; legacy anchors keep their existing token behavior. */
  designContract?: AnchorDesignContract;
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
  ctaLabel?: string;
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
  pageIntent: PageIntent;
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
  affectedIds?: string[];
  overrideReason?: string;
  drift?: DriftReport;
}

export interface DriftReport {
  tokenDeltas: Array<{ token: string; from: string | number; to: string | number }>;
  sectionFlips: Array<{ sectionId: string; from: SectionMode; to: SectionMode }>;
  activeOverrides: ScopedOverride[];
}
