import type { IrDocument } from './types';
import { makeRevision } from './revisions';

export const vektorFixture: IrDocument = {
  brandName: 'Vektor Audio',
  pageIntent: 'home',
  anchor: {
    id: 'anchor_v1',
    name: 'Vektor Audio',
    mood: 'technical-dark',
    createdFromRevisionId: 'initial',
    compositionRules: {
      allowedHeroLayouts: ['product-led', 'editorial-split'],
      allowedCollectionLayouts: ['product-grid', 'index-list'],
      forbiddenPatterns: ['soft-editorial-cards', 'oversized-empty-hero'],
      tensionBudget: { min: 0, max: 2, recommended: 1 },
    },
    tokens: {
      color: { ink: '#F4F5F7', paper: '#101317', accent: '#B8D8E8', muted: '#929BA5', line: '#303840', surface: '#1B2229' },
      type: { family: 'Inter', display: 94, body: 15 },
      space: { section: 104, content: 76, tight: 16 },
      radius: { card: 4, image: 4 },
    },
  },
  sections: [
    { id: 'sec_hero', role: 'hero', intent: 'editorial', nodes: [{ id: 'node_hero_title', type: 'hero', eyebrow: 'VEKTOR AUDIO / SOUND OBJECTS', title: 'Sound, without compromise.', body: 'Considered acoustics. Precision engineering. An unmistakable presence.', imageAssetId: 'jbl-charge-6', alt: 'JBL Charge 6 portable speaker' }] },
    { id: 'sec_collection', role: 'collection', intent: 'index', nodes: [{ id: 'node_collection', type: 'collection', title: 'Objects of sound.', body: 'A focused selection of listening tools and portable sound.', items: [
      { id: 'item_charge', title: 'Charge 6', detail: 'Portable speaker · JBL' , imageAssetId: 'jbl-charge-6' },
      { id: 'item_flip', title: 'Flip 7', detail: 'Compact portable speaker · JBL', imageAssetId: 'jbl-flip-7' },
      { id: 'item_mw75', title: 'MW75', detail: 'Wireless over-ear headphones · Master & Dynamic', imageAssetId: 'master-mw75' },
    ] }] },
  ],
  approvedAssets: [
    { id: 'jbl-charge-6', title: 'JBL Charge 6', category: 'bluetooth-speakers', imageUrl: 'https://vlrpiosbqssfnycutzje.supabase.co/storage/v1/object/public/zuno-product-images/Electronics/bluetooth-speakers/jbl-charge-6.png', alt: 'JBL Charge 6' },
    { id: 'jbl-flip-7', title: 'JBL Flip 7', category: 'bluetooth-speakers', imageUrl: 'https://vlrpiosbqssfnycutzje.supabase.co/storage/v1/object/public/zuno-product-images/Electronics/bluetooth-speakers/jbl-flip-7.png', alt: 'JBL Flip 7' },
    { id: 'master-mw75', title: 'Master Dynamic MW75', category: 'headphones', imageUrl: 'https://vlrpiosbqssfnycutzje.supabase.co/storage/v1/object/public/zuno-product-images/Electronics/headphones/master-dynamic-mw75.png', alt: 'Master Dynamic MW75 headphones' },
  ],
  overrides: [],
};

export const koraFixture: IrDocument = {
  brandName: 'Kora Spatial',
  pageIntent: 'home',
  anchor: {
    id: 'anchor_v1',
    name: 'Kora Spatial',
    mood: 'quiet-editorial',
    createdFromRevisionId: 'initial',
    compositionRules: {
      allowedHeroLayouts: ['type-led', 'editorial-split'],
      allowedCollectionLayouts: ['index-list', 'editorial-grid'],
      forbiddenPatterns: ['rounded-product-cards', 'dense-commerce-grid'],
      tensionBudget: { min: 0, max: 1, recommended: 0 },
    },
    tokens: {
      color: { ink: '#24231F', paper: '#F2EFE9', accent: '#A85C43', muted: '#6D675F', line: '#D8D2C8', surface: '#E8E3DA' },
      type: { family: 'Inter', display: 104, body: 15 },
      space: { section: 120, content: 88, tight: 18 },
      radius: { card: 0, image: 0 },
    },
  },
  sections: [
    { id: 'sec_hero', role: 'hero', intent: 'editorial', nodes: [{ id: 'node_hero_title', type: 'hero', eyebrow: 'KORA SPATIAL / ARCHITECTURE & PLACE', title: 'Designing Silence', body: 'Spaces shaped by light, material and the quiet intelligence of form.', artwork: 'architecture-lines' }] },
    { id: 'sec_collection', role: 'collection', intent: 'index', nodes: [{ id: 'node_collection', type: 'collection', title: 'A study in restraint.', body: 'Selected explorations in proportion, atmosphere and everyday ritual.', items: [
      { id: 'item_house', title: 'House on the Ridge', detail: 'Residential · Nairobi highlands' },
      { id: 'item_courtyard', title: 'The Quiet Courtyard', detail: 'Hospitality · Coastal Kenya' },
      { id: 'item_pavilion', title: 'Light Pavilion', detail: 'Cultural · Spatial study' },
    ] }] },
  ],
  approvedAssets: [],
  overrides: [],
};

export function initialFixtureRevision(document: IrDocument) {
  return makeRevision(document, 'Initial design', 'initial', null);
}
