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
      type: { family: 'Inter', display: 56, body: 16 },
      space: { section: 80, content: 76, tight: 16 },
      radius: { card: 4, image: 4 },
    },
    designContract: {
      layoutIntent: { primary: 'dense', secondary: 'shoppable' },
      spacing: { scale: [8, 16, 24, 32, 48, 80, 120], contentWidth: 1200, mobileScale: 0.6 },
      typography: {
        displayFamily: 'Inter', bodyFamily: 'Inter', display: 56, heading: 40, body: 16, label: 10,
        lineHeight: { display: 1.05, heading: 1.2, body: 1.55, label: 1.4 },
        labelLetterSpacing: 0.12, labelUppercase: true,
      },
      palette: { dominant: '#101317', supporting: '#1B2229', ink: '#F4F5F7', accent: '#B8D8E8', gradient: 'none' },
      restraint: { maxColors: 4, maxTypefaces: 2, maxShadowStyles: 1, maxRadiusSystems: 1 },
      exceptions: [],
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
      type: { family: 'Inter', display: 72, body: 16 },
      space: { section: 120, content: 88, tight: 18 },
      radius: { card: 0, image: 0 },
    },
    designContract: {
      layoutIntent: { primary: 'editorial', secondary: 'trust' },
      spacing: { scale: [8, 16, 24, 32, 48, 80, 120], contentWidth: 1200, mobileScale: 0.6, heroTopException: { value: 160, reason: 'Editorial architecture hero needs a deliberate, spacious opening.' } },
      typography: {
        displayFamily: 'Inter', bodyFamily: 'Inter', display: 72, heading: 56, body: 16, label: 11,
        lineHeight: { display: 1.05, heading: 1.2, body: 1.55, label: 1.4 },
        labelLetterSpacing: 0.12, labelUppercase: true,
      },
      palette: { dominant: '#F2EFE9', supporting: '#E8E3DA', ink: '#24231F', accent: '#A85C43', gradient: 'none' },
      restraint: { maxColors: 4, maxTypefaces: 2, maxShadowStyles: 1, maxRadiusSystems: 1 },
      exceptions: [{ rule: 'hero-top-padding', scope: 'hero', reason: 'Editorial architecture hero needs a deliberate, spacious opening.' }],
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
