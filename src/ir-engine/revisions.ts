import type { BrandIdentityAnchor, DriftReport, IrDocument, IrRevision, IrSection, ScopedOverride } from './types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(freezeDeep);
  }
  return value;
}

export function makeRevision(
  document: IrDocument,
  label: string,
  kind: IrRevision['kind'],
  parentId: string | null,
  metadata: Pick<IrRevision, 'affectedIds' | 'overrideReason' | 'drift'> = {}
): IrRevision {
  const id = 'rev_' + Math.random().toString(36).slice(2, 9);
  const snapshot = clone(document);
  if (kind === 'initial' || kind === 'full-redesign') snapshot.anchor.createdFromRevisionId = id;
  return freezeDeep({
    id,
    parentId,
    label,
    kind,
    anchorId: snapshot.anchor.id,
    document: snapshot,
    createdAt: new Date().toISOString(),
    ...metadata,
  });
}

export function applyHeadlineEdit(document: IrDocument, nodeId: string, title: string): IrDocument {
  const next = clone(document);
  const node = next.sections.flatMap((section) => section.nodes).find((item) => item.id === nodeId);
  if (!node) throw new Error('The requested headline node no longer exists.');
  node.title = title;
  return next;
}

export function applyAssetSwap(document: IrDocument, nodeId: string, assetId: string, reason: string): IrDocument {
  const next = clone(document);
  const asset = next.approvedAssets.find((item) => item.id === assetId);
  if (!asset) throw new Error('That image is not in the approved asset library.');
  const node = next.sections.flatMap((section) => section.nodes).find((item) => item.id === nodeId);
  if (!node) throw new Error('The requested image node no longer exists.');
  node.imageAssetId = asset.id;
  node.alt = asset.alt;
  next.overrides = next.overrides.filter((override) => !(override.targetId === nodeId && override.field === 'imageAssetId'));
  next.overrides.push({
    id: 'override_' + Math.random().toString(36).slice(2, 8),
    targetId: nodeId,
    field: 'imageAssetId',
    overrideReason: reason,
    affectedIds: [nodeId],
  });
  return next;
}

export function applyHeroMoodShift(document: IrDocument, sectionId: string, mood: BrandIdentityAnchor['mood'], reason: string): IrDocument {
  const next = clone(document);
  const section = next.sections.find((item) => item.id === sectionId);
  if (!section) throw new Error('The requested section no longer exists.');

  if (mood === next.anchor.mood) {
    section.intent = section.role === 'hero' ? 'editorial' : 'index';
    section.moodOverride = undefined;
    section.tokenOverrides = undefined;
    next.overrides = next.overrides.filter((override) => !(override.targetId === sectionId && override.field === 'intent+tokens'));
    return next;
  }

  const previous = section.intent;
  section.intent = mood === 'technical-dark' ? 'product-led' : 'editorial';
  section.moodOverride = mood;
  section.tokenOverrides = {
    color: mood === 'warm-editorial'
      ? { ink: '#29231F', paper: '#F1E9DE', accent: '#A64F35', muted: '#6D675F', line: '#D8C9B9', surface: '#E8DED2' }
      : { ink: '#F4F5F7', paper: '#101317', accent: '#B8D8E8', muted: '#929BA5', line: '#303840', surface: '#1B2229' },
  };
  next.overrides = next.overrides.filter((override) => !(override.targetId === sectionId && override.field === 'intent+tokens'));
  next.overrides.push({
    id: 'override_' + Math.random().toString(36).slice(2, 8),
    targetId: sectionId,
    field: 'intent+tokens',
    overrideReason: reason + ' (section intent: ' + previous + ' → ' + section.intent + ')',
    affectedIds: [sectionId],
  });
  return next;
}

export function applyFullRedesign(document: IrDocument, mood: BrandIdentityAnchor['mood']): IrDocument {
  const next = clone(document);
  const anchorId = 'anchor_v' + (Number(next.anchor.id.split('_v')[1] ?? 1) + 1);
  next.anchor = {
    ...next.anchor,
    id: anchorId,
    mood,
    createdFromRevisionId: 'pending',
  };
  next.overrides = [];
  next.sections = next.sections.map((section) => ({
    ...section,
    intent: section.role === 'hero' ? 'editorial' : 'index',
    moodOverride: undefined,
    tokenOverrides: undefined,
  }));
  if (mood === 'technical-dark') {
    next.anchor.tokens = {
      ...next.anchor.tokens,
      color: { ink: '#F4F5F7', paper: '#101317', accent: '#B8D8E8', muted: '#929BA5', line: '#303840', surface: '#1B2229' },
    };
  } else if (mood === 'warm-editorial') {
    next.anchor.tokens = {
      ...next.anchor.tokens,
      color: { ink: '#29231F', paper: '#F1E9DE', accent: '#A64F35', muted: '#776D63', line: '#D8C9B9', surface: '#E8DED2' },
    };
  }
  return next;
}


export function getChangedIrIds(before: IrDocument, after: IrDocument): string[] {
  const changed = new Set<string>();
  const beforeSections = new Map(before.sections.map((section) => [section.id, section]));
  const afterSections = new Map(after.sections.map((section) => [section.id, section]));

  for (const sectionId of new Set([...beforeSections.keys(), ...afterSections.keys()])) {
    const left = beforeSections.get(sectionId);
    const right = afterSections.get(sectionId);
    if (!left || !right) {
      changed.add(sectionId);
      continue;
    }
    if (left.intent !== right.intent || left.moodOverride !== right.moodOverride ||
        JSON.stringify(left.tokenOverrides) !== JSON.stringify(right.tokenOverrides)) {
      changed.add(sectionId);
    }
    const beforeNodes = new Map(left.nodes.map((node) => [node.id, node]));
    const afterNodes = new Map(right.nodes.map((node) => [node.id, node]));
    for (const nodeId of new Set([...beforeNodes.keys(), ...afterNodes.keys()])) {
      if (JSON.stringify(beforeNodes.get(nodeId)) !== JSON.stringify(afterNodes.get(nodeId))) {
        changed.add(nodeId);
      }
      const beforeItems = beforeNodes.get(nodeId)?.items ?? [];
      const afterItems = afterNodes.get(nodeId)?.items ?? [];
      const beforeItemMap = new Map(beforeItems.map((item) => [item.id, item]));
      const afterItemMap = new Map(afterItems.map((item) => [item.id, item]));
      for (const itemId of new Set([...beforeItemMap.keys(), ...afterItemMap.keys()])) {
        if (JSON.stringify(beforeItemMap.get(itemId)) !== JSON.stringify(afterItemMap.get(itemId))) {
          changed.add(itemId);
        }
      }
    }
  }

  if (JSON.stringify(before.anchor) !== JSON.stringify(after.anchor)) changed.add(after.anchor.id);
  return [...changed];
}

export function rollbackDocument(revision: IrRevision): IrDocument {
  return clone(revision.document);
}

export function computeDrift(anchor: BrandIdentityAnchor, document: IrDocument, anchorSections?: IrSection[]): DriftReport {
  const tokenDeltas: DriftReport['tokenDeltas'] = [];
  const flatten = (value: object, prefix = ''): Array<[string, string | number]> => {
    const entries: Array<[string, string | number]> = [];
    Object.entries(value).forEach(([key, child]) => {
      const token = prefix ? prefix + '.' + key : key;
      if (child && typeof child === 'object') entries.push(...flatten(child as object, token));
      else entries.push([token, child as string | number]);
    });
    return entries;
  };
  const base = new Map(flatten(anchor.tokens));
  flatten(document.anchor.tokens).forEach(([token, value]) => {
    const from = base.get(token);
    if (from !== value) tokenDeltas.push({ token, from: from ?? '', to: value });
  });
  document.sections.forEach((section) => {
    if (!section.tokenOverrides) return;
    flatten(section.tokenOverrides).forEach(([token, value]) => {
      const from = base.get(token);
      if (from !== value) tokenDeltas.push({ token: 'sections.' + section.id + '.' + token, from: from ?? '', to: value });
    });
  });
  const sectionFlips: DriftReport['sectionFlips'] = [];
  const anchorModes = new Map<string, IrSection['intent']>();
  (anchorSections ?? document.sections).forEach((section) => anchorModes.set(section.id, section.intent));
  document.sections.forEach((section) => {
    const original = anchorModes.get(section.id);
    if (original && original !== section.intent) sectionFlips.push({ sectionId: section.id, from: original, to: section.intent });
  });
  const activeOverrides: ScopedOverride[] = document.overrides.slice();
  return { tokenDeltas, sectionFlips, activeOverrides };
}
