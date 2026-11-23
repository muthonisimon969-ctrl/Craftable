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
    id: '3d_game_studio',
    name: '3D Game Studio',
    badgeLabel: 'Indie 3D Games',
    shortSummary: 'Zuno AI blueprint for playable 3D platformers, endless runners, space shooters & 3D stackers with perspective lighting & touch controls',
    industries: ['3D Platformer', '3D Endless Runner', '3D Space Shooter', '3D Arcade & Stacker', 'HTML5 3D Engine', 'Indie Browser Game'],
    visualDirection:
      'Finished indie 3D browser/mobile game aesthetic with real perspective Z-depth projection, directional shaded 3D faces, atmospheric distance fog, 3D particle bursts, camera shake, and frosted glass HUD.',
    colorSystem:
      'Cohesive 3D worlds (Cyber Grid 3D, Solar Canyon 3D, Void Nebula 3D) synchronizing 3D sky fog, neon horizon grids, shaded block geometry, and HUD accents.',
    typographyPairing:
      'Bold geometric display titles paired with crisp tracked micro-labels and tabular monospace score/combo readouts.',
    layoutBlueprint:
      'Studio header (difficulty, 3D world palette, Web Audio SFX toggle) -> Frosted HUD (Score, Best Trophy, Hearts/Streak, Level) -> Responsive 16:10 3D perspective Canvas stage with Title/Pause/Game Over summary cards -> Mobile D-Pad + glowing 3D Action deck.',
    interactivePatterns:
      'Playable 3D Sky Obby Platformer, 3D Neon Trench Runner, 3D Starfighter Trench Shooter, and 3D Tower Stacker; full keyboard + mobile touch controls; 3D projection, particles, SFX, and instant restart.',
    starterPrompt:
      'Use the 3D Game Studio blueprint to build a polished indie 3D browser game with perspective 3D environments, directional lighting and fog, animated 3D hero and enemy meshes, particle bursts, floating score popups, Start and Game Over screens, difficulty modes, and keyboard plus mobile touch controls.',
    defaultTemplateType: 'web_app',
    canvasHex: '#070B18',
    surfaceHex: '#121A33',
    accentHex: '#38BDF8',
  },

  {
    id: 'maison_noire',
    name: 'Maison Noire',
    badgeLabel: 'Luxury Editorial',
    shortSummary: 'High-fashion editorial storefront with dramatic art direction, oversized typography and immersive collections',
    industries: ['Luxury Fashion', 'Designer Clothing', 'Jewelry', 'Premium Beauty', 'Luxury Retail'],
    visualDirection: 'An art-directed luxury fashion house: cinematic campaign imagery, asymmetrical editorial composition, generous negative space, fine hairlines, restrained motion, and a sophisticated dark-ink / warm-paper contrast. Avoid generic ecommerce grids.',
    colorSystem: 'Ink Black (#11100F), Soft Chalk (#F5F1EA), Smoked Taupe (#A79C8D), muted antique brass (#9B8058), and quiet stone borders (#DED8CF). Use brass sparingly.',
    typographyPairing: 'High-contrast editorial serif display paired with a precise neutral grotesk for navigation, product metadata and body copy. Use expressive scale contrast and tight headline leading.',
    layoutBlueprint: 'Slim announcement rail -> restrained masthead with spacious navigation -> full-bleed campaign hero with offset headline and one decisive CTA -> asymmetrical seasonal story panels -> editorial collection index -> product feature with generous image and concise details -> brand journal strip -> minimal multi-column footer.',
    interactivePatterns: 'Accessible mobile navigation, collection filters, product quick-view dialog, size/variant selector, bag drawer with quantity updates, toast feedback and keyboard-operable controls.',
    starterPrompt: 'Create a luxury fashion house website with bespoke editorial art direction, a cinematic campaign hero, asymmetrical collection storytelling, refined serif typography, accessible collection filters, product quick-view and a functional shopping bag. It must feel like a high-end independent fashion studio, not a generic ecommerce theme.',
    defaultTemplateType: 'landing_page',
    canvasHex: '#F5F1EA',
    surfaceHex: '#11100F',
    accentHex: '#9B8058',
  },
  {
    id: 'obsidian_tech',
    name: 'Obsidian Tech',
    badgeLabel: 'Premium Electronics',
    shortSummary: 'Product-first technology storefront with precision layouts, technical detail and editorial product showcases',
    industries: ['Electronics', 'Consumer Technology', 'Audio', 'Computers', 'Gaming Hardware', 'Smart Devices'],
    visualDirection: 'Precision-led product design with graphite surfaces, crisp white space, macro product photography, disciplined alignment, technical microcopy and restrained electric-blue accents. Make products the hero; avoid neon overload and generic card walls.',
    colorSystem: 'Graphite (#101216), Porcelain (#F4F5F6), Steel (#8C949E), Electric Cobalt (#315CF5), and cool border (#DDE1E6). Use light and dark sections intentionally.',
    typographyPairing: 'Modern neo-grotesk display and body system with tabular numerals for prices, specifications and comparison data. Keep labels compact and body text highly legible.',
    layoutBlueprint: 'Compact utility header -> bold split product launch hero with large approved product image -> featured category rail -> editorial product spotlight with specification column -> curated product collection -> comparison/specification table -> support and warranty band -> clean footer.',
    interactivePatterns: 'Live search, category filters, sort controls, product detail dialog, variant selector, compare toggle, cart drawer, quantity controls and validated enquiry / checkout handoff.',
    starterPrompt: 'Build a premium electronics storefront with a precision product-launch hero, large product imagery, useful specifications, curated categories, product comparisons, working search and filters, and a functional cart or requested order flow. The design should feel like a premium technology brand.',
    defaultTemplateType: 'web_app',
    canvasHex: '#F4F5F6',
    surfaceHex: '#101216',
    accentHex: '#315CF5',
  },
  {
    id: 'forma_estates',
    name: 'Forma Estates',
    badgeLabel: 'Architecture & Property',
    shortSummary: 'Architectural property showcase with immersive photography, refined listing details and enquiry journeys',
    industries: ['Real Estate', 'Property Development', 'Architecture', 'Interior Design', 'Luxury Homes'],
    visualDirection: 'Architectural magazine meets premium property studio: calm mineral palette, monumental photography, asymmetrical image pairings, carefully spaced typography, and elegant property data. Never use a generic map-and-card dashboard as the main visual.',
    colorSystem: 'Limestone (#F0EEE8), Deep Olive Ink (#242923), Warm White (#FBFAF7), Muted Moss (#777F6B), and Sandstone (#D8D0C2).',
    typographyPairing: 'Sculptural editorial serif headlines with a restrained humanist sans for descriptions, location metadata and property specifications.',
    layoutBlueprint: 'Minimal studio masthead -> immersive featured residence hero -> short architectural point-of-view statement -> alternating full-width and asymmetrical property stories -> curated available residences with price and key facts -> location / neighbourhood feature -> enquiry panel -> restrained footer.',
    interactivePatterns: 'Property category and price filters, accessible listing detail view, gallery controls for supplied images, save/favourite toggle and validated viewing enquiry form.',
    starterPrompt: 'Create a premium architecture and real-estate website with monumental property imagery, editorial storytelling, asymmetrical layouts, elegant property facts, searchable listings and a working viewing enquiry form. Do not invent addresses, prices or property claims.',
    defaultTemplateType: 'landing_page',
    canvasHex: '#F0EEE8',
    surfaceHex: '#242923',
    accentHex: '#777F6B',
  },
  {
    id: 'atelier_hospitality',
    name: 'Atelier Hospitality',
    badgeLabel: 'Restaurant & Boutique Stay',
    shortSummary: 'Atmospheric hospitality website with immersive food or destination imagery and polished reservations',
    industries: ['Fine Dining', 'Restaurants', 'Boutique Hotels', 'Cafes', 'Hospitality', 'Travel'],
    visualDirection: 'Atmospheric, tactile hospitality art direction with warm natural materials, full-bleed approved imagery, editorial menus and calm transitions. Choose a palette based on the actual venue; avoid default beige template styling.',
    colorSystem: 'Choose from deep cacao (#251D19), linen (#F4EFE6), olive leaf (#69745A), clay (#A65D43), and warm charcoal (#302B27), adapting accents to the brand.',
    typographyPairing: 'Characterful editorial serif for venue identity and section titles, paired with a clear contemporary sans for menus, booking details and body copy.',
    layoutBlueprint: 'Quiet reservation / contact strip -> distinctive venue masthead -> immersive atmosphere hero -> concise concept and provenance story -> signature menu / rooms feature -> editorial gallery using only approved assets -> hours and location details when supplied -> reservation or enquiry panel -> considered footer.',
    interactivePatterns: 'Menu category navigation, dietary labels when provided, reservation form with date / time / party size, inline validation, confirmation state and tap-to-call directions where details are supplied.',
    starterPrompt: 'Design an exceptional restaurant or boutique hospitality website with immersive venue photography, editorial storytelling, elegant menu or room presentation, clear practical details and a working reservation or enquiry flow. Only use business facts supplied by the user.',
    defaultTemplateType: 'landing_page',
    canvasHex: '#F4EFE6',
    surfaceHex: '#251D19',
    accentHex: '#A65D43',
  },
  {
    id: 'lumen_saas',
    name: 'Lumen Product Studio',
    badgeLabel: 'SaaS & AI Products',
    shortSummary: 'Distinctive software launch system with product-led storytelling, interface previews and conversion-focused pricing',
    industries: ['SaaS', 'AI Products', 'Developer Tools', 'Fintech', 'B2B Software', 'Productivity Apps'],
    visualDirection: 'Confident product-led software art direction with crisp grid logic, strong typographic hierarchy, purposeful product screenshots, subtle depth and a controlled signature accent. Avoid generic gradient blobs and fake dashboard metrics.',
    colorSystem: 'Near Ink (#11131A), Cloud (#F7F8FA), Mist (#E8EBF1), Iris (#6557D9), and Signal Mint (#7BC9AE). Select either light or dark dominant mode according to the product.',
    typographyPairing: 'Contemporary grotesk display and UI sans with monospace micro-labels for product data, version details and technical annotations.',
    layoutBlueprint: 'Compact product navigation -> clear product promise with real interface preview -> customer problem / solution narrative -> feature story told through varied interface compositions -> workflow / integration section only for real capabilities -> pricing comparison with transparent terms -> FAQ -> focused conversion footer.',
    interactivePatterns: 'Responsive navigation, functional pricing-period switch when applicable, feature tabs, product demo state, FAQ accordion, validated waitlist / contact form and clear success feedback.',
    starterPrompt: 'Build a premium SaaS or AI product website with a strong product promise, believable interface previews, varied feature storytelling, transparent pricing where supplied, responsive navigation and working conversion forms. Never invent customers, integrations, performance claims or metrics.',
    defaultTemplateType: 'landing_page',
    canvasHex: '#F7F8FA',
    surfaceHex: '#11131A',
    accentHex: '#6557D9',
  },
  {
    id: 'northstar_creative',
    name: 'Northstar Creative',
    badgeLabel: 'Independent Creative Studio',
    shortSummary: 'Art-directed agency and portfolio layout with oversized type, asymmetrical case studies and expressive project storytelling',
    industries: ['Creative Agencies', 'Brand Studios', 'Designers', 'Photographers', 'Production Studios', 'Portfolios'],
    visualDirection: 'Bold independent creative direction: expressive oversized typography, unexpected but disciplined composition, generous margins, strong project imagery and a distinct editorial grid. Each project should feel curated, not boxed into repetitive cards.',
    colorSystem: 'Paper White (#F4F2ED), Carbon (#171717), Acid Chartreuse (#D6F36A), Soft Grey (#B9B8B2), and clean white (#FFFFFF). Accent may be recoloured to match the studio identity.',
    typographyPairing: 'Expressive grotesk display with a compact neutral sans for project details, captions, services and navigation. Use deliberate shifts in scale and weight.',
    layoutBlueprint: 'Minimal studio signature -> oversized positioning statement with offset visual -> selected work presented as an editorial sequence of varied image ratios -> capabilities and approach -> featured case study with challenge / process / outcome -> studio profile -> contact invitation -> typographic footer.',
    interactivePatterns: 'Project category filtering, accessible case-study navigation, hover states with reduced-motion fallback, mobile menu and validated project enquiry form.',
    starterPrompt: 'Create a distinctive creative agency or portfolio website with oversized typography, art-directed project storytelling, varied image compositions, a clear capabilities section and a working enquiry flow. Avoid generic three-column card grids and invented client logos.',
    defaultTemplateType: 'landing_page',
    canvasHex: '#F4F2ED',
    surfaceHex: '#171717',
    accentHex: '#D6F36A',
  },
];

export function findTemplateById(id: string): DesignTemplate | undefined {
  return DESIGN_TEMPLATES.find((t) => t.id === id);
}
