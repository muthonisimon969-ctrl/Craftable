import type {
  CollectionLayout,
  HeroLayout,
  IrDocument,
} from './types';

export interface CompositionPlan {
  hero: HeroLayout;
  collection: CollectionLayout;
  tensionBudget: { min: number; max: number; recommended: number };
}

function chooseAllowed<T extends string>(
  preferred: T,
  allowed: T[] | undefined,
  valid: readonly T[],
  fallback: T
): T {
  const safeAllowed = Array.isArray(allowed) ? allowed.filter((value) => valid.includes(value)) : [];
  if (!safeAllowed.length) return valid.includes(preferred) ? preferred : fallback;
  return safeAllowed.includes(preferred) ? preferred : safeAllowed[0] ?? fallback;
}

/**
 * Deterministic composition selection. The Anchor limits the visual language;
 * page intent and actual content choose among the permitted compositions.
 * This function never changes section order or invents content/assets.
 */
export function resolveComposition(document: IrDocument): CompositionPlan {
  const heroSection = document.sections.find((section) => section.role === 'hero');
  const collectionSection = document.sections.find((section) => section.role === 'collection');
  const heroNode = heroSection?.nodes[0];
  const hasVisual = Boolean(heroNode?.imageAssetId || heroNode?.artwork);
  const intent = document.pageIntent ?? 'home';
  const mood = document.anchor.mood;

  const preferredHero: HeroLayout =
    intent === 'product' || mood === 'technical-dark'
      ? 'product-led'
      : !hasVisual || mood === 'quiet-editorial'
        ? 'type-led'
        : 'editorial-split';

  const preferredCollection: CollectionLayout =
    intent === 'product' || collectionSection?.intent === 'product-led' || mood === 'technical-dark'
      ? 'product-grid'
      : intent === 'projects' || intent === 'services' || collectionSection?.intent === 'editorial'
        ? 'editorial-grid'
        : 'index-list';

  const rules = document.anchor.compositionRules;
  const hero = chooseAllowed(preferredHero, rules?.allowedHeroLayouts, ['type-led', 'editorial-split', 'product-led'], 'editorial-split');
  const collection = chooseAllowed(preferredCollection, rules?.allowedCollectionLayouts, ['index-list', 'editorial-grid', 'product-grid'], 'index-list');
  const budget = rules?.tensionBudget ?? { min: 0, max: 1, recommended: 0 };

  return {
    hero,
    collection,
    tensionBudget: {
      min: Math.max(0, Math.min(3, budget.min)),
      max: Math.max(0, Math.min(3, budget.max)),
      recommended: Math.max(0, Math.min(3, budget.recommended)),
    },
  };
}
