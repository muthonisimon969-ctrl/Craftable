import type { ApprovedAsset, CollectionLayout, HeroLayout, IrDocument, IrNode } from './types';
import { resolveComposition } from './composition';

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function assetImage(document: IrDocument, id?: string, alt = ''): string {
  const asset = document.approvedAssets.find((item) => item.id === id);
  if (!asset) return '';
  const url = new URL(asset.imageUrl);
  const approvedOrigin = 'https://vlrpiosbqssfnycutzje.supabase.co';
  if (url.protocol !== 'https:' || url.origin !== approvedOrigin ||
      !url.pathname.startsWith('/storage/v1/object/public/zuno-product-images/')) return '';
  return '<img src="' + esc(asset.imageUrl) + '" alt="' + esc(alt || asset.alt) + '" loading="eager">';
}

function architectureArtwork(): string {
  return '<svg class="artwork architecture-art" viewBox="0 0 620 500" role="img" aria-label="Architectural line drawing"><defs><linearGradient id="archGlow" x1="0" x2="1"><stop stop-color="#B56A4D" stop-opacity=".08"/><stop offset="1" stop-color="#B56A4D" stop-opacity=".42"/></linearGradient></defs><path d="M70 410 310 55l240 355M70 410h480M145 410V270l165-215 165 215v140M145 270h330M230 410V300h160v110M310 55v355M70 410 310 300l240 110" fill="url(#archGlow)" stroke="currentColor" stroke-width="1.2" opacity=".82"/><path d="M100 375 310 95l210 280M185 410V285l125-165 125 165v125" fill="none" stroke="currentColor" stroke-width=".7" opacity=".5"/><circle cx="310" cy="300" r="5" fill="#B56A4D"/></svg>';
}

function audioArtwork(): string {
  return '<svg class="artwork audio-art" viewBox="0 0 600 460" role="img" aria-label="Abstract concentric audio waveforms"><g fill="none" stroke="currentColor"><circle cx="300" cy="230" r="55" stroke-width="1.5"/><circle cx="300" cy="230" r="95" stroke-width="1.2" opacity=".7"/><circle cx="300" cy="230" r="140" stroke-width="1" opacity=".5"/><circle cx="300" cy="230" r="190" stroke-width=".8" opacity=".3"/><path d="M300 35v390M105 230h390M162 92l276 276M438 92 162 368" opacity=".25"/></g><circle cx="300" cy="230" r="9" fill="#B8D8E8"/></svg>';
}

function renderHero(document: IrDocument, section: IrDocument['sections'][number], node: IrNode, layout: HeroLayout): string {
  const image = assetImage(document, node.imageAssetId, node.alt);
  const art = node.artwork === 'architecture-lines' ? architectureArtwork() : node.artwork === 'audio-rings' ? audioArtwork() : '';
  const colors = section.tokenOverrides?.color;
  const scopedStyle = colors ? ' style="--section-ink:' + colors.ink + ';--section-paper:' + colors.paper + ';--section-accent:' + colors.accent + ';--section-muted:' + colors.muted + ';--section-line:' + colors.line + ';--section-surface:' + colors.surface + '"' : '';
  return '<section id="hero" class="hero hero--' + layout + '" data-ir-id="' + esc(section.id) + '"' + scopedStyle + '><div class="hero-copy"><p class="eyebrow">' + esc(node.eyebrow ?? '') + '</p><h1 data-ir-id="' + esc(node.id) + '">' + esc(node.title ?? '') + '</h1><p class="hero-body">' + esc(node.body ?? '') + '</p><a class="hero-cta" href="#collection">' + esc(node.ctaLabel || 'Explore more') + '<span aria-hidden="true">↗</span></a><span class="hero-mark">' + esc(document.brandName) + ' <i></i> Independent by design</span></div><div class="hero-visual">' + (image ? '<div class="hero-image">' + image + '</div>' : art) + '</div></section>';
}

function renderCollection(document: IrDocument, section: IrDocument['sections'][number], node: IrNode, layout: CollectionLayout): string {
  const items = (node.items ?? []).map((item, index) => {
    const image = assetImage(document, item.imageAssetId, item.title);
    return '<article class="collection-item" data-ir-id="' + esc(item.id) + '"><div class="item-index">0' + (index + 1) + '</div>' +
      (image ? '<div class="item-image">' + image + '</div>' : '<div class="item-art"><span>' + String(index + 1).padStart(2, '0') + '</span></div>') +
      '<div class="item-copy"><h3>' + esc(item.title) + '</h3><p>' + esc(item.detail) + '</p></div><span class="item-arrow">↗</span></article>';
  }).join('');
  return '<section id="collection" class="collection collection--' + layout + '" data-ir-id="' + esc(section.id) + '"><div class="collection-heading"><p class="eyebrow">SELECTED WORK / 2026</p><h2>' + esc(node.title ?? 'A considered collection') + '</h2><p>' + esc(node.body ?? '') + '</p></div><div class="collection-list">' + items + '</div></section>';
}

export function compileDocument(document: IrDocument): string {
  const heroSection = document.sections.find((section) => section.role === 'hero');
  const collectionSection = document.sections.find((section) => section.role === 'collection');
  const hero = heroSection?.nodes[0];
  const collection = collectionSection?.nodes[0];
  if (!hero || !collection || !heroSection || !collectionSection) throw new Error('The v1 compiler requires exactly one hero and one collection node.');
  const { color, type, space, radius } = document.anchor.tokens;
  const contract = document.anchor.designContract;
  const typeContract = contract?.typography;
  const spacingContract = contract?.spacing;
  const palette = contract?.palette;
  const spacingScale = spacingContract?.scale?.length ? spacingContract.scale : [8, 16, 24, 32, 48, 80, 120];
  const nearestSpacing = (value: number) => spacingScale.reduce((best, current) =>
    Math.abs(current - value) < Math.abs(best - value) ? current : best, spacingScale[0]);
  const mobileFactor = spacingContract?.mobileScale ?? 0.6;
  const sectionSpace = nearestSpacing(space.section);
  const sectionMobile = nearestSpacing(sectionSpace * mobileFactor);
  const heroTop = spacingContract?.heroTopException?.value ?? sectionSpace;
  const heroTopMobile = nearestSpacing(heroTop * mobileFactor);
  const contentWidth = spacingContract?.contentWidth ?? 1200;
  const displayFamily = typeContract?.displayFamily ?? type.family;
  const bodyFamily = typeContract?.bodyFamily ?? type.family;
  const displaySize = typeContract?.display ?? type.display;
  const headingSize = typeContract?.heading ?? Math.round(type.display * 0.62);
  const bodySize = typeContract?.body ?? type.body;
  const labelSize = typeContract?.label ?? 10;
  const displayLineHeight = typeContract?.lineHeight.display ?? 1.05;
  const headingLineHeight = typeContract?.lineHeight.heading ?? 1.2;
  const bodyLineHeight = typeContract?.lineHeight.body ?? 1.55;
  const labelLineHeight = typeContract?.lineHeight.label ?? 1.4;
  const labelTracking = typeContract?.labelLetterSpacing ?? 0.12;
  const labelTransform = typeContract?.labelUppercase === false ? 'none' : 'uppercase';
  const heroBackground = palette?.gradient === 'subtle-depth'
    ? 'linear-gradient(135deg,' + (palette.dominant || color.paper) + ',' + (palette.supporting || color.surface) + ')'
    : 'var(--paper)';
  const composition = resolveComposition(document);
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(document.brandName) + '</title><style>' +
    ':root{--ink:' + color.ink + ';--paper:' + color.paper + ';--accent:' + color.accent + ';--muted:' + color.muted + ';--line:' + color.line + ';--surface:' + color.surface + ';--dominant:' + (palette?.dominant ?? color.paper) + ';--supporting:' + (palette?.supporting ?? color.surface) + ';--hero-background:' + heroBackground + ';--font-display:' + esc(displayFamily) + ';--font-body:' + esc(bodyFamily) + ';--display:' + displaySize + 'px;--heading:' + headingSize + 'px;--body:' + bodySize + 'px;--label-size:' + labelSize + 'px;--display-line-height:' + displayLineHeight + ';--heading-line-height:' + headingLineHeight + ';--body-line-height:' + bodyLineHeight + ';--label-line-height:' + labelLineHeight + ';--label-letter-spacing:' + labelTracking + 'em;--label-transform:' + labelTransform + ';--section:' + space.section + 'px;--section-mobile:' + sectionMobile + 'px;--hero-top:' + heroTop + 'px;--hero-top-mobile:' + heroTopMobile + 'px;--content-width:' + contentWidth + 'px;--content:' + space.content + 'px;--tight:' + space.tight + 'px;--radius:' + radius.card + 'px;--image-radius:' + radius.image + 'px}' +
    '*,*:before,*:after{box-sizing:border-box}html{background:var(--paper);color:var(--ink);font-family:var(--font-body),Arial,sans-serif}body{margin:0} .site{max-width:none;margin:auto}.site-header{min-height:76px;padding:16px max(24px,calc((100vw - var(--content-width))/2));display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid var(--line);background:var(--paper)}.site-brand{font-size:15px;font-weight:650;letter-spacing:-.035em;color:var(--ink);text-decoration:none}.site-nav{display:flex;align-items:center;gap:28px}.site-nav a{color:var(--muted);font-size:12px;text-decoration:none}.site-nav a:hover{color:var(--ink)}.site-header-cta{color:var(--paper)!important;background:var(--ink);padding:12px 17px;border-radius:3px}.hero{color:var(--section-ink,var(--ink));background:var(--hero-background,var(--section-paper,var(--paper)));border-bottom:1px solid var(--section-line,var(--line));min-height:680px;padding:clamp(var(--hero-top-mobile),11vw,var(--hero-top)) max(24px,calc((100vw - var(--content-width))/2));display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,84px);align-items:center;overflow:hidden}.hero-copy{position:relative;z-index:1}.eyebrow{font-size:var(--label-size);letter-spacing:var(--label-letter-spacing);line-height:var(--label-line-height);text-transform:var(--label-transform);color:var(--section-muted,var(--muted));font-weight:600;margin:0 0 28px}.hero h1{font-family:var(--font-display);font-size:clamp(42px,6vw,var(--display));line-height:var(--display-line-height);letter-spacing:-.075em;font-weight:500;max-width:720px;margin:0}.hero-body{font-family:var(--font-body);font-size:clamp(14px,1.2vw,17px);line-height:var(--body-line-height);color:var(--section-muted,var(--muted));max-width:390px;margin:32px 0 0}.hero-cta{display:inline-flex;align-items:center;gap:26px;margin-top:28px;padding:15px 19px;background:var(--section-ink,var(--ink));color:var(--section-paper,var(--paper));font-size:12px;text-decoration:none;min-height:48px}.hero-cta span{font-size:16px}.hero-mark{display:flex;align-items:center;gap:12px;margin-top:68px;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--section-muted,var(--muted))}.hero-mark i{width:34px;height:1px;background:var(--section-accent,var(--accent))}.hero-visual{min-width:0;position:relative;display:grid;place-items:center;min-height:420px}.artwork{width:100%;max-width:620px;color:var(--section-accent,var(--accent));overflow:visible}.architecture-art{transform:rotate(-4deg)}.audio-art{color:#B8D8E8}.hero-image{width:100%;height:min(54vw,510px);min-height:330px;background:var(--section-surface,var(--surface));border-radius:var(--image-radius);display:grid;place-items:center;overflow:hidden;padding:24px}.hero-image img{width:100%;height:100%;object-fit:contain} .collection{padding:clamp(var(--section-mobile),8vw,var(--section)) max(24px,calc((100vw - var(--content-width))/2)) 100px}.collection-heading{display:grid;grid-template-columns:1fr 1.3fr;gap:20px 48px;align-items:end;margin-bottom:42px}.collection-heading .eyebrow{grid-column:1/-1;margin:0}.collection-heading h2{font-family:var(--font-display);font-size:clamp(32px,4vw,var(--heading));letter-spacing:-.06em;line-height:var(--heading-line-height);margin:0;font-weight:500}.collection-heading>p:last-child{max-width:390px;color:var(--muted);font-family:var(--font-body);font-size:var(--body);line-height:var(--body-line-height);margin:0}.collection-list{border-top:1px solid var(--line)}.collection-item{display:grid;grid-template-columns:42px minmax(100px,180px) 1fr 28px;gap:24px;align-items:center;padding:22px 0;border-bottom:1px solid var(--line)}.item-index{font-size:10px;color:var(--muted);letter-spacing:.1em}.item-image{height:110px;background:var(--surface);border-radius:var(--image-radius);padding:8px;display:grid;place-items:center;overflow:hidden}.item-image img{width:100%;height:100%;object-fit:contain}.item-art{height:110px;background:var(--surface);border:1px solid var(--line);display:grid;place-items:center;color:var(--accent);font-size:34px;font-weight:300}.item-copy h3{font-family:var(--font-display);font-size:clamp(17px,2vw,var(--heading));font-weight:500;letter-spacing:-.04em;margin:0 0 7px}.item-copy p{font-size:12px;color:var(--muted);margin:0;line-height:1.6}.item-arrow{font-size:19px;color:var(--muted)}.site-footer{padding:32px max(24px,calc((100vw - var(--content-width))/2));border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:20px;color:var(--muted);font-size:11px}.site-footer a{color:var(--ink);text-decoration:none}.hero--type-led{grid-template-columns:1.15fr .85fr}.hero--product-led .hero-visual{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:clamp(18px,3vw,36px)}.collection--product-grid .collection-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;border-top:0}.collection--product-grid .collection-item{display:flex;flex-direction:column;align-items:stretch;gap:14px;padding:16px;border:1px solid var(--line);border-radius:var(--radius)}.collection--product-grid .item-index{font-size:10px}.collection--product-grid .item-image,.collection--product-grid .item-art{aspect-ratio:4/3;height:auto;min-height:0;width:100%}.collection--product-grid .item-copy h3{font-size:20px}.collection--product-grid .item-arrow{align-self:flex-end}.collection--editorial-grid .collection-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;border-top:0}.collection--editorial-grid .collection-item{display:flex;flex-direction:column;align-items:stretch;gap:14px;padding:0 0 18px;border:0;border-bottom:1px solid var(--line)}.collection--editorial-grid .item-image,.collection--editorial-grid .item-art{height:240px;width:100%}.collection--editorial-grid .item-copy h3{font-size:22px}@media(max-width:700px){.site-header{min-height:64px}.site-nav{gap:12px}.site-nav a{font-size:11px}.site-nav a:not(.site-header-cta){display:none}.site-footer{align-items:flex-start;flex-direction:column}.hero{min-height:0;grid-template-columns:1fr;padding:var(--hero-top-mobile) 24px 54px;gap:26px}.hero h1{font-size:clamp(40px,12vw,var(--display));max-width:600px}.hero-body{margin-top:22px}.hero-mark{margin-top:38px}.hero-visual{min-height:260px}.hero-image{height:300px;min-height:260px} .collection{padding:var(--section-mobile) 24px 72px}.collection-heading{grid-template-columns:1fr;gap:18px;margin-bottom:26px}.collection-heading .eyebrow{grid-column:auto}.collection-item{grid-template-columns:24px 82px 1fr 16px;gap:12px;padding:16px 0}.item-image,.item-art{height:78px}.item-copy p{font-size:11px}.item-index{font-size:9px}.item-arrow{font-size:15px}.collection--product-grid .collection-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.collection--product-grid .collection-item{padding:10px}.collection--product-grid .item-image,.collection--product-grid .item-art{height:auto;min-height:0}.collection--editorial-grid .collection-list{gap:16px}.collection--editorial-grid .item-image,.collection--editorial-grid .item-art{height:160px}}@media(max-width:420px){.collection--product-grid .collection-list,.collection--editorial-grid .collection-list{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}' +
    '</style></head><body><main class="site"><header class="site-header"><a class="site-brand" href="#hero">' + esc(document.brandName) + '</a><nav class="site-nav" aria-label="Main navigation"><a href="#hero">Overview</a><a href="#collection">Explore</a><a class="site-header-cta" href="#collection">Get started</a></nav></header>' + renderHero(document, heroSection, hero, composition.hero) + renderCollection(document, collectionSection, collection, composition.collection) + '<footer class="site-footer"><span>© ' + new Date().getFullYear() + ' ' + esc(document.brandName) + '</span><a href="#hero">Back to top ↑</a></footer></main></body></html>';
  return html;
}

export function findApprovedAsset(document: IrDocument, assetId: string): ApprovedAsset | undefined {
  return document.approvedAssets.find((asset) => asset.id === assetId);
}


export interface CompiledIrOutput {
  html: string;
  css: string;
  js: string;
  hash: string;
}

/**
 * Browser-side adapter for the existing preview pipeline. The IR compiler owns
 * the complete document; DOMParser separates its body and stylesheet without
 * regex slicing. The preview iframe isolates the stylesheet from Zuno's UI.
 */
export function compileDocumentParts(document: IrDocument): CompiledIrOutput {
  if (typeof DOMParser === 'undefined') {
    throw new Error('IR compilation requires a browser DOM environment.');
  }
  const fullDocument = compileDocument(document);
  const parsed = new DOMParser().parseFromString(fullDocument, 'text/html');
  const style = parsed.head.querySelector('style');
  const main = parsed.body.querySelector('main.site');
  if (!style || !main) {
    throw new Error('The IR compiler returned an incomplete document.');
  }
  const html = '<main class="site zuno-ir-project">' + main.innerHTML + '</main>';
  const css = style.textContent ?? '';
  const source = JSON.stringify(document);
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return { html, css, js: '', hash: (hash >>> 0).toString(16).padStart(8, '0') };
}
