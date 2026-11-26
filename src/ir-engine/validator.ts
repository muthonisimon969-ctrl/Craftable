import type { IrDocument } from './types';

export interface IrValidationIssue {
  code: string;
  message: string;
  targetId?: string;
}

export interface IrValidationReport {
  failures: IrValidationIssue[];
  warnings: IrValidationIssue[];
  canPublish: boolean;
}

const APPROVED_ASSET_ORIGIN = 'https://vlrpiosbqssfnycutzje.supabase.co';
const APPROVED_ASSET_PREFIX = '/storage/v1/object/public/zuno-product-images/';

function contrastRatio(foreground: string, background: string): number | null {
  const parse = (value: string): number[] | null => {
    const match = /^#([0-9a-f]{6})$/i.exec(value);
    if (!match) return null;
    const channels = [0, 2, 4].map((offset) => parseInt(match[1].slice(offset, offset + 2), 16) / 255);
    return channels.map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
    );
  };
  const a = parse(foreground);
  const b = parse(background);
  if (!a || !b) return null;
  const luminance = (rgb: number[]) => 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  const values = [luminance(a), luminance(b)].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function isApprovedAssetUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.origin === APPROVED_ASSET_ORIGIN &&
      url.pathname.startsWith(APPROVED_ASSET_PREFIX) && !url.username && !url.password;
  } catch {
    return false;
  }
}

/**
 * Static, deterministic checks for the current IR v1 compiler contract.
 * Runtime layout checks (real overflow, clipping and image framing) belong
 * to the browser preview/release gate, not this function.
 */
export function validateIrV1Document(document: IrDocument, baseline?: IrDocument): IrValidationReport {
  const failures: IrValidationIssue[] = [];
  const warnings: IrValidationIssue[] = [];
  const fail = (code: string, message: string, targetId?: string) =>
    failures.push({ code, message, ...(targetId ? { targetId } : {}) });
  const warn = (code: string, message: string, targetId?: string) =>
    warnings.push({ code, message, ...(targetId ? { targetId } : {}) });

  if (!document.brandName.trim()) fail('BRAND_NAME_MISSING', 'A brand name is required.');
  const validIntents = ['home', 'launch', 'services', 'projects', 'about', 'product', 'contact', 'other'];
  if (document.pageIntent && !validIntents.includes(document.pageIntent)) fail('PAGE_INTENT_INVALID', 'Choose a supported page intent.');
  const compositionRules = document.anchor.compositionRules;
  if (compositionRules) {
    const heroLayouts = ['type-led', 'editorial-split', 'product-led'];
    const collectionLayouts = ['index-list', 'editorial-grid', 'product-grid'];
    if (!Array.isArray(compositionRules.allowedHeroLayouts) ||
        !compositionRules.allowedHeroLayouts.length ||
        compositionRules.allowedHeroLayouts.some((layout) => !heroLayouts.includes(layout))) {
      fail('HERO_COMPOSITION_PERMISSION_INVALID', 'The Brand Anchor contains an empty or unsupported hero layout permission.');
    }
    if (!Array.isArray(compositionRules.allowedCollectionLayouts) ||
        !compositionRules.allowedCollectionLayouts.length ||
        compositionRules.allowedCollectionLayouts.some((layout) => !collectionLayouts.includes(layout))) {
      fail('COLLECTION_COMPOSITION_PERMISSION_INVALID', 'The Brand Anchor contains an empty or unsupported collection layout permission.');
    }
    const budget = compositionRules.tensionBudget;
    if (!budget || ![budget.min, budget.max, budget.recommended].every((value) => Number.isFinite(value)) ||
        budget.min < 0 || budget.max > 3 || budget.min > budget.max ||
        budget.recommended < budget.min || budget.recommended > budget.max) {
      fail('TENSION_BUDGET_INVALID', 'The Brand Anchor tension budget must be ordered between 0 and 3.');
    }
  }
  if (document.sections.length !== 2) {
    fail('V1_SECTION_COUNT', 'IR v1 currently requires exactly one hero and one collection section.');
  }

  const ids = new Set<string>();
  const registerId = (id: string, label: string) => {
    if (!id.trim()) fail('ID_EMPTY', label + ' has an empty ID.');
    else if (ids.has(id)) fail('ID_DUPLICATE', 'Duplicate document ID: ' + id, id);
    else ids.add(id);
  };

  const heroSections = document.sections.filter((section) => section.role === 'hero');
  const collectionSections = document.sections.filter((section) => section.role === 'collection');
  if (heroSections.length !== 1) fail('HERO_SECTION_COUNT', 'The document must contain exactly one hero section.');
  if (collectionSections.length !== 1) fail('COLLECTION_SECTION_COUNT', 'The document must contain exactly one collection section.');
  if (heroSections[0] && heroSections[0].nodes.length !== 1) fail('HERO_NODE_COUNT', 'The v1 hero section must contain exactly one hero node.', heroSections[0].id);
  if (collectionSections[0] && collectionSections[0].nodes.length !== 1) fail('COLLECTION_NODE_COUNT', 'The v1 collection section must contain exactly one collection node.', collectionSections[0].id);

  document.sections.forEach((section) => {
    registerId(section.id, 'Section');
    if (!section.nodes.length) fail('SECTION_EMPTY', 'Section has no content nodes.', section.id);
    section.nodes.forEach((node) => {
      registerId(node.id, 'Node');
      if (section.role === 'hero' && node.type !== 'hero') fail('HERO_NODE_TYPE', 'Hero section contains an unsupported node.', node.id);
      if (section.role === 'collection' && node.type !== 'collection') fail('COLLECTION_NODE_TYPE', 'Collection section contains an unsupported node.', node.id);
      if (!node.title?.trim()) fail('NODE_TITLE_MISSING', 'A required heading is missing.', node.id);
      if ((node.title?.length ?? 0) > 120) warn('HEADING_LONG', 'This heading may wrap awkwardly on small screens.', node.id);
      if ((node.body?.length ?? 0) > 260) warn('BODY_COPY_LONG', 'Long copy may weaken the section hierarchy.', node.id);
      if (node.imageAssetId) {
        const asset = document.approvedAssets.find((item) => item.id === node.imageAssetId);
        if (!asset) fail('ASSET_REFERENCE_BROKEN', 'An image references an asset that is not approved.', node.id);
        else if (!isApprovedAssetUrl(asset.imageUrl)) fail('ASSET_URL_UNAPPROVED', 'An image URL is outside the approved asset storage path.', asset.id);
        else if (!asset.alt.trim()) warn('ASSET_ALT_MISSING', 'Add descriptive alternative text for this image.', asset.id);
      }
      (node.items ?? []).forEach((item) => {
        registerId(item.id, 'Collection item');
        if (!item.title.trim()) fail('COLLECTION_ITEM_TITLE_MISSING', 'A collection item needs a title.', item.id);
        if (item.imageAssetId) {
          const asset = document.approvedAssets.find((candidate) => candidate.id === item.imageAssetId);
          if (!asset) fail('ASSET_REFERENCE_BROKEN', 'A collection item references an unapproved image.', item.id);
          else if (!isApprovedAssetUrl(asset.imageUrl)) fail('ASSET_URL_UNAPPROVED', 'A collection image URL is outside the approved asset storage path.', asset.id);
        }
      });
    });
  });

  const assetIds = new Set<string>();
  document.approvedAssets.forEach((asset) => {
    if (assetIds.has(asset.id)) fail('ASSET_ID_DUPLICATE', 'Duplicate approved asset ID: ' + asset.id, asset.id);
    assetIds.add(asset.id);
    if (!isApprovedAssetUrl(asset.imageUrl)) fail('ASSET_URL_UNAPPROVED', 'An approved asset has an invalid storage URL.', asset.id);
  });

  const tokens = document.anchor.tokens;
  const colorSets = [
    { id: 'anchor', color: tokens.color },
    ...document.sections.map((section) => ({
      id: section.id,
      color: section.tokenOverrides?.color,
    })).filter((entry) => Boolean(entry.color)),
  ];
  colorSets.forEach(({ id, color }) => {
    if (!color) return;
    if (!/^#[0-9a-f]{6}$/i.test(color.ink) || !/^#[0-9a-f]{6}$/i.test(color.paper) ||
        !/^#[0-9a-f]{6}$/i.test(color.muted) || !/^#[0-9a-f]{6}$/i.test(color.accent) ||
        !/^#[0-9a-f]{6}$/i.test(color.line) || !/^#[0-9a-f]{6}$/i.test(color.surface)) {
      fail('COLOR_TOKEN_INVALID', 'Color tokens must use six-digit hexadecimal values.', id);
      return;
    }
    const bodyContrast = contrastRatio(color.muted, color.paper);
    if (bodyContrast !== null && bodyContrast < 4.5) {
      fail('BODY_CONTRAST_LOW', 'Muted body text contrast is below WCAG AA 4.5:1.', id);
    }
    const headingContrast = contrastRatio(color.ink, color.paper);
    if (headingContrast !== null && headingContrast < 4.5) {
      fail('HEADING_CONTRAST_LOW', 'Heading contrast is below WCAG AA 4.5:1.', id);
    }
  });

  if (!/^[a-zA-Z0-9 ,'-]{1,80}$/.test(tokens.type.family)) {
    fail('FONT_FAMILY_INVALID', 'The font family contains unsupported characters.');
  }
  if (![tokens.type.display, tokens.type.body].every((value) => Number.isFinite(value)) ||
      tokens.type.display < 32 || tokens.type.display > 160 || tokens.type.body < 12 || tokens.type.body > 24) {
    fail('TYPE_SCALE_INVALID', 'Typography sizes are outside the supported design range.');
  }
  if ([tokens.space.section, tokens.space.content, tokens.space.tight].some((value) => !Number.isFinite(value) || value < 0 || value > 240)) {
    fail('SPACE_TOKEN_INVALID', 'Spacing tokens must be finite values between 0 and 240.');
  }
  if ([tokens.radius.card, tokens.radius.image].some((value) => !Number.isFinite(value) || value < 0 || value > 64)) {
    fail('RADIUS_TOKEN_INVALID', 'Radius tokens must be finite values between 0 and 64.');
  }

  const contract = document.anchor.designContract;
  if (contract) {
    const validIntents = ['editorial', 'dense', 'shoppable', 'trust'];
    const layoutIntent = contract.layoutIntent;
    if (!layoutIntent || !validIntents.includes(layoutIntent.primary) ||
        !validIntents.includes(layoutIntent.secondary) ||
        layoutIntent.primary === layoutIntent.secondary) {
      fail('ANCHOR_LAYOUT_INTENT_INVALID', 'The Anchor must declare distinct primary and secondary layout intents.');
    }

    const spacing = contract.spacing;
    if (!spacing) {
      fail('ANCHOR_SPACING_MISSING', 'The Anchor spacing contract is missing.');
    } else {
      const scale = spacing.scale;
      const expectedScale = [8, 16, 24, 32, 48, 80, 120];
      if (!Array.isArray(scale) || scale.length !== expectedScale.length ||
          expectedScale.some((value, index) => scale[index] !== value)) {
        fail('ANCHOR_SPACING_SCALE_INVALID', 'The Anchor spacing scale must use the shared 8, 16, 24, 32, 48, 80, 120px reference stops.');
      }
      if (!Number.isFinite(spacing.contentWidth) || spacing.contentWidth < 960 || spacing.contentWidth > 1600) {
        fail('ANCHOR_CONTENT_WIDTH_INVALID', 'Anchor content width must be between 960px and 1600px.');
      }
      if (!Number.isFinite(spacing.mobileScale) || spacing.mobileScale < 0.45 || spacing.mobileScale > 0.8) {
        fail('ANCHOR_MOBILE_SCALE_INVALID', 'Mobile spacing scale must be between 0.45 and 0.8.');
      }
      const heroException = spacing.heroTopException;
      if (heroException && (!Number.isFinite(heroException.value) ||
          heroException.value < 120 || heroException.value > 200 || !heroException.reason?.trim())) {
        fail('ANCHOR_HERO_EXCEPTION_INVALID', 'A hero spacing exception needs a value between 120px and 200px and a reason.');
      }
    }

    const typography = contract.typography;
    if (!typography) {
      fail('ANCHOR_TYPOGRAPHY_MISSING', 'The Anchor typography contract is missing.');
    } else {
      const typefaces = [typography.displayFamily, typography.bodyFamily].filter(Boolean);
      if (new Set(typefaces).size > 2 || typefaces.some((family) => !/^[a-zA-Z0-9 ,'-]{1,80}$/.test(family ?? ''))) {
        fail('ANCHOR_TYPEFACES_INVALID', 'The Anchor may use at most two valid typefaces.');
      }
      if (![typography.display, typography.heading, typography.body, typography.label].every(Number.isFinite) ||
          typography.display < 32 || typography.display > 120 ||
          typography.heading < 24 || typography.heading > typography.display ||
          typography.body < 14 || typography.body > 22 ||
          typography.label < 9 || typography.label > 14) {
        fail('ANCHOR_TYPE_SCALE_INVALID', 'Anchor typography sizes are outside the supported design range.');
      }
      const leading = typography.lineHeight;
      if (!leading || ![leading.display, leading.heading, leading.body, leading.label].every(Number.isFinite) ||
          leading.display < 1 || leading.display > 1.2 ||
          leading.heading < 1.1 || leading.heading > 1.4 ||
          leading.body < 1.4 || leading.body > 1.8 ||
          leading.label < 1.2 || leading.label > 1.6) {
        fail('ANCHOR_LINE_HEIGHT_INVALID', 'Anchor line heights must remain within readable display, heading, body and label ranges.');
      }
      if (!Number.isFinite(typography.labelLetterSpacing) ||
          typography.labelLetterSpacing < 0 || typography.labelLetterSpacing > 0.25) {
        fail('ANCHOR_LABEL_TRACKING_INVALID', 'Label letter spacing must be between 0 and 0.25em.');
      }
    }

    const palette = contract.palette;
    if (!palette) {
      fail('ANCHOR_PALETTE_MISSING', 'The Anchor UI palette contract is missing.');
    } else {
      const paletteColors = [palette.dominant, palette.supporting, palette.ink, palette.accent];
      if (paletteColors.some((value) => !/^#[0-9a-f]{6}$/i.test(value))) {
        fail('ANCHOR_PALETTE_INVALID', 'Anchor UI palette roles must use six-digit hexadecimal colors.');
      }
      if (palette.gradient === 'subtle-depth' && !palette.gradientReason?.trim()) {
        fail('ANCHOR_GRADIENT_REASON_MISSING', 'A subtle UI gradient must be declared with a reason.');
      }
      if (palette.gradient !== 'none' && palette.gradient !== 'subtle-depth') {
        fail('ANCHOR_GRADIENT_INVALID', 'Only no gradient or one subtle depth gradient is supported.');
      }
    }

    const restraint = contract.restraint;
    if (!restraint || restraint.maxColors < 3 || restraint.maxColors > 6 ||
        restraint.maxTypefaces < 1 || restraint.maxTypefaces > 2 ||
        restraint.maxShadowStyles < 0 || restraint.maxShadowStyles > 1 ||
        restraint.maxRadiusSystems !== 1) {
      fail('ANCHOR_RESTRAINT_INVALID', 'Anchor restraint limits exceed the supported palette, typeface, shadow or radius system.');
    }
    if (!Array.isArray(contract.exceptions)) {
      fail('ANCHOR_EXCEPTIONS_INVALID', 'Anchor exceptions must be an array.');
    } else {
      contract.exceptions.forEach((exception) => {
        if (!exception?.rule?.trim() || !exception?.scope?.trim() || !exception?.reason?.trim()) {
          fail('ANCHOR_EXCEPTION_INCOMPLETE', 'Every Anchor exception must declare its rule, scope and reason.');
        }
      });
    }
  }

  if (baseline) {
    const originalOrder = baseline.sections.map((section) => section.id);
    const currentOrder = document.sections.map((section) => section.id);
    if (originalOrder.length !== currentOrder.length || originalOrder.some((id, index) => currentOrder[index] !== id)) {
      fail('SECTION_ORDER_CHANGED', 'Scoped edits must preserve the original section order.');
    }
  }

  return { failures, warnings, canPublish: failures.length === 0 };
}
