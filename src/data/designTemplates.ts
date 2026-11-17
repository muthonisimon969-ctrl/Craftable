import type { DesignTemplate } from '../types/project';

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'kenyan_commerce',
    name: 'Savanna Manual Pay',
    badgeLabel: 'Manual M-Pesa • KSh',
    shortSummary: 'Modern Kenyan store with KSh pricing, Till/Paybill guide & manual code verification',
    industries: ['Kenyan Business', 'Nairobi Retail', 'Manual M-Pesa Store', 'Local Commerce', 'East African Services'],
    visualDirection:
      'Contemporary, confident East African retail aesthetic with crisp surfaces and friction-free manual M-Pesa checkout (no Daraja API required).',
    colorSystem:
      'Warm Stone (#FAFAF9) canvas, Crisp White (#FFFFFF) cards, Deep Charcoal (#14181F) ink, Savanna Emerald (#15803D) primary CTA, Warm Gold (#D97706) highlights.',
    typographyPairing:
      'Modern geometric sans headings paired with high-contrast legible body text and tabular KSh currency alignment.',
    layoutBlueprint:
      'Clean header with store mark, Owner Verify tab & Bag counter -> Flagship storefront hero with Nairobi/regional delivery promise -> Category filter & search -> Product catalog with KSh totals -> Manual M-Pesa Checkout drawer (Till/Paybill copy, phone +2547XX, M-Pesa confirmation code submission) -> Owner Verification panel.',
    interactivePatterns:
      'KSh formatting, live shopping bag, 1-tap Copy Till/Paybill number, manual M-Pesa confirmation code submission into Pending Verification, Owner confirm/reject payment state persisted in localStorage.',
    starterPrompt:
      'Build a modern Kenyan retail store with KSh pricing, category filters, shopping bag, and manual M-Pesa payments (show Till and Paybill details with copy button, let customers enter their +254 phone and M-Pesa confirmation code without Daraja API, and include an owner verification tab to confirm payments).',
    defaultTemplateType: 'web_app',
    canvasHex: '#FAFAF9',
    surfaceHex: '#14181F',
    accentHex: '#15803D',
  },
  {
    id: 'atelier_editorial',
    name: 'Maison Atelier',
    badgeLabel: 'Luxury Fashion',
    shortSummary: 'Quiet editorial elegance, serif pairing, lookbook cards & quick-view bag drawer',
    industries: ['Luxury', 'Fashion', 'Beauty', 'Jewelry', 'Architecture', 'Boutique Hotel'],
    visualDirection: 'Quiet luxury, editorial restraint, generous negative space, crisp 1px hairlines, refined motion.',
    colorSystem:
      'Warm Alabaster (#FAF8F5) canvas, Deep Espresso (#181615) ink, Champagne Gold (#B8924A) accent, Soft Stone (#EAE5DD) borders.',
    typographyPairing: 'Editorial serif display headings (Georgia, serif) paired with tracked sans body and airy uppercase micro-labels.',
    layoutBlueprint:
      'Minimalist sticky header with brand mark & bag trigger -> Editorial split hero with concise headline & CTA -> Collection category tabs & curated lookbook grid -> Quick-view modal with size selector -> Slide-over bag drawer.',
    interactivePatterns:
      'Collection filters, quick-view product modal with size/finish selection, slide-over shopping bag drawer, subtle toast feedback.',
    starterPrompt:
      'Create an editorial luxury fashion brand site with quiet serif typography, warm alabaster and champagne tones, seasonal lookbook filters, quick-view size selector modal, and shopping bag drawer.',
    defaultTemplateType: 'landing_page',
    canvasHex: '#FAF8F5',
    surfaceHex: '#181615',
    accentHex: '#B8924A',
  },
  {
    id: 'precision_tech',
    name: 'PulseMetrics SaaS',
    badgeLabel: 'Tech & Analytics',
    shortSummary: 'Dark engineered slate, interactive SVG trend charts & monthly/annual calculator',
    industries: ['Technology', 'AI', 'SaaS', 'Developer Tools', 'Analytics', 'Cybersecurity'],
    visualDirection: 'Modern, crisp, engineered precision with high-legibility slate surfaces, 1px borders, and zero neon clutter.',
    colorSystem:
      'Deep Slate (#0B0F19) base, Elevated Card (#111827), Slate Border (#1E293B), Indigo (#4F46E5) primary, Emerald (#10B981) status.',
    typographyPairing: 'Geometric sans headings with tabular numerals (tabular-nums) and monospace accents for KPIs and code.',
    layoutBlueprint:
      'Compact top nav -> Focused hero with live metric preview -> Interactive SVG revenue chart with period switcher -> Monthly/Annual pricing calculator -> Clean footer.',
    interactivePatterns: 'Timeframe chart toggles, Monthly/Annual billing switch, interactive seat/tier estimator, instant clipboard copy.',
    starterPrompt:
      'Build a sleek SaaS analytics dashboard with MRR KPIs, interactive SVG revenue trend chart, timeframe toggles, and a monthly/annual pricing calculator.',
    defaultTemplateType: 'dashboard',
    canvasHex: '#0B0F19',
    surfaceHex: '#1E293B',
    accentHex: '#4F46E5',
  },
  {
    id: 'culinary_bistro',
    name: 'Osteria Bistro',
    badgeLabel: 'Restaurant & Cafe',
    shortSummary: 'Warm inviting cream & terracotta palette, dietary menu filters & table booking',
    industries: ['Restaurant', 'Cafe', 'Bakery', 'Coffee Roastery', 'Catering', 'Hospitality'],
    visualDirection: 'Warm, inviting, tactile, appetizing hospitality aesthetic without visual clutter.',
    colorSystem:
      'Warm Cream (#FCF9F3) canvas, Roasted Espresso (#231914) ink, Terracotta (#B45309) accent, Sage (#3F6212) dietary tags.',
    typographyPairing: 'Warm editorial serif headings paired with clean humanist sans body copy.',
    layoutBlueprint:
      'Clean nav with Menu & Reserve CTA -> Atmospheric hero with hours pill -> Filterable menu with dietary tags & order tray -> Interactive table reservation form.',
    interactivePatterns:
      'Course & dietary filter tabs, live order tray with subtotal, validated table reservation form with instant confirmation.',
    starterPrompt:
      'Design a warm restaurant website with seasonal menu filtering, dietary tags, order tray, and an interactive table reservation form.',
    defaultTemplateType: 'landing_page',
    canvasHex: '#FCF9F3',
    surfaceHex: '#231914',
    accentHex: '#B45309',
  },
  {
    id: 'corporate_advisory',
    name: 'Meridian Advisory',
    badgeLabel: 'Corporate & B2B',
    shortSummary: 'Structured ivory & deep navy authority, practice pillars & consultation booking',
    industries: ['Corporate', 'Finance', 'Legal', 'Consulting', 'Healthcare', 'Real Estate', 'B2B'],
    visualDirection: 'Authoritative, trustworthy, calm, structured layout with crisp contrast and zero gimmicks.',
    colorSystem:
      'Pure Ivory (#FFFFFF) & Cool Off-White (#F4F6FA) bands, Deep Navy (#0F172A) ink, Trust Cobalt (#1D4ED8) primary action.',
    typographyPairing: 'Crisp neo-grotesque sans hierarchy with tabular KPIs and generous 1.6 body line-height.',
    layoutBlueprint:
      'Structured top bar -> Split executive hero -> 3-column practice pillars -> Impact KPIs strip -> Interactive consultation booking & fee estimator.',
    interactivePatterns:
      'Practice pillar switcher, interactive project scope/retainer estimator, validated consultation booking form.',
    starterPrompt:
      'Create an authoritative corporate advisory website with practice pillar tabs, KPI impact strip, retainer scope estimator, and consultation booking form.',
    defaultTemplateType: 'web_app',
    canvasHex: '#F4F6FA',
    surfaceHex: '#0F172A',
    accentHex: '#1D4ED8',
  },
  {
    id: 'tactile_utility',
    name: 'FlowLedger Studio',
    badgeLabel: 'Utility & Workspace',
    shortSummary: 'Focused tactile tracker with inline edits, visual breakdown & local persistence',
    industries: ['Productivity', 'Calculator', 'Tracker', 'Planner', 'Booking Tool', 'Education'],
    visualDirection: 'Focused, calm app-like utility with tactile controls, thoughtful empty states, and instant feedback.',
    colorSystem:
      'Soft Neutral (#F5F6F8) workspace, Crisp White (#FFFFFF) panels, Slate (#0F172A) text, Cobalt (#2563EB) action, Emerald (#10B981) positive state.',
    typographyPairing: 'Clean UI sans-serif with monospace tabular readouts for amounts, timers, and percentages.',
    layoutBlueprint:
      'Compact workspace header -> Live summary readout bar -> Interactive add/filter form -> Dynamic list with empty state & inline delete/toggle.',
    interactivePatterns:
      'Instant calculation updates, category filters, localStorage persistence, inline item edits, clean empty state.',
    starterPrompt:
      'Build a tactile expense and bill-splitting utility workspace with instant totals, category breakdown bar, inline add/remove items, and localStorage persistence.',
    defaultTemplateType: 'utility',
    canvasHex: '#F5F6F8',
    surfaceHex: '#FFFFFF',
    accentHex: '#2563EB',
  },
  {
    id: '2d_game_studio',
    name: '2D Game Studio',
    badgeLabel: 'Indie 2D Games',
    shortSummary: 'Finished-feel 2D platformers, endless runners, puzzle & arcade games with parallax worlds, particles & touch controls',
    industries: ['2D Platformer', 'Endless Runner', 'Puzzle Game', 'Arcade Game', 'HTML5 Canvas', 'Indie Browser Game'],
    visualDirection:
      'Polished indie mobile/browser game aesthetic with multi-layer parallax skies, ambient lighting, articulated squash-and-stretch sprites, particle bursts, floating score popups, and frosted glass HUD.',
    colorSystem:
      'Cohesive themed palettes (Celestial Dusk, Cyber Horizon, Emerald Ruins) syncing canvas atmosphere, beveled platforms, glowing collectibles, and glassmorphic HUD accents.',
    typographyPairing:
      'Bold geometric display titles paired with crisp tracked micro-labels and tabular monospace score/combo readouts.',
    layoutBlueprint:
      'Sleek studio header (difficulty, palette theme, Web Audio SFX toggle) -> Glassmorphic HUD (Score, Best Trophy, Hearts/Moves, Level) -> Responsive 16:10 parallax Canvas stage with frosted Title/Pause/Game Over cards -> Ergonomic tactile D-pad & glowing Action deck.',
    interactivePatterns:
      'Playable 2D Platformer, Endless Runner, 4x4 Jewel Merge Puzzle, and Star Defender Arcade; keyboard + multi-pointer mobile touch controls; particles, screen shake, floating popups, procedural SFX, and instant restart.',
    starterPrompt:
      'Create a visually polished indie 2D browser game with rich parallax backgrounds, atmospheric lighting, expressive animated hero and enemy sprites, particle effects, floating score popups, styled Start and Game Over screens, keyboard and mobile touch controls, score tracking, difficulty levels, and instant restart.',
    defaultTemplateType: 'web_app',
    canvasHex: '#0A0E1A',
    surfaceHex: '#131A2D',
    accentHex: '#38BDF8',
  },
];

export function findTemplateById(id: string): DesignTemplate | undefined {
  return DESIGN_TEMPLATES.find((t) => t.id === id);
}
