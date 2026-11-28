export interface QualityCheckItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface QualityAuditReport {
  checks: QualityCheckItem[];
  passedCount: number;
  totalCount: number;
  failedChecks: QualityCheckItem[];
  allPassed: boolean;
  conciseSummary: string;
}

const KENYAN_PROMPT_KEYWORDS = [
  'kenya',
  'kenyan',
  'nairobi',
  'mombasa',
  'kisumu',
  'nakuru',
  'eldoret',
  'm-pesa',
  'mpesa',
  'ksh',
  'kes',
  'safaricom',
  '+254',
  'east africa',
];

const EXTERNAL_BROKEN_IMG_REGEX = /<img\b[^>]*\bsrc\s*=\s*["']https?:\/\/(?!vlrpiosbqssfnycutzje\.supabase\.co\/storage\/v1\/object\/public\/zuno-product-images\/)[^"']+["']/i;
const PLACEHOLDER_TEXT_REGEX = /\b(lorem ipsum|dolor sit amet|coming soon placeholder|todo:)\b/i;
const FIXED_HUGE_WIDTH_REGEX = /(?<![a-z-])width\s*:\s*(9\d{2}|[1-9]\d{3,})px\b/i;

export function hasBalancedDelimiters(code: string): boolean {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let prevChar = '';
  const stack: string[] = [];

  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    const next = i + 1 < code.length ? code[i + 1] : '';

    if (inLineComment) {
      if (c === '\n') inLineComment = false;
      prevChar = c;
      continue;
    }
    if (inBlockComment) {
      if (c === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
        prevChar = '/';
        continue;
      }
      prevChar = c;
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
      if (c === '/' && next === '/') {
        inLineComment = true;
        i += 1;
        prevChar = '/';
        continue;
      }
      if (c === '/' && next === '*') {
        inBlockComment = true;
        i += 1;
        prevChar = '*';
        continue;
      }
    }

    const escaped = prevChar === '\\';
    if (!escaped) {
      if (c === "'" && !inDoubleQuote && !inTemplate) inSingleQuote = !inSingleQuote;
      else if (c === '"' && !inSingleQuote && !inTemplate) inDoubleQuote = !inDoubleQuote;
      else if (c === '`' && !inSingleQuote && !inDoubleQuote) inTemplate = !inTemplate;
    }

    if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
      if (c === '{' || c === '(' || c === '[') {
        stack.push(c);
      } else if (c === '}') {
        if (stack.pop() !== '{') return false;
      } else if (c === ')') {
        if (stack.pop() !== '(') return false;
      } else if (c === ']') {
        if (stack.pop() !== '[') return false;
      }
    }

    prevChar = escaped && c === '\\' ? '' : c;
  }

  return stack.length === 0 && !inSingleQuote && !inDoubleQuote && !inTemplate;
}

export function auditGeneratedBundle(
  prompt: string,
  htmlCode: string,
  cssCode: string,
  jsCode: string
): QualityAuditReport {
  const checks: QualityCheckItem[] = [];

  // 1. Structural completeness
  const hasHeading = /<h[12]\b/i.test(htmlCode);
  const hasNavOrHeader = /<(header|nav)\b/i.test(htmlCode);
  const hasSectionOrMain = /<(main|section|article)\b/i.test(htmlCode);
  const hasInteractiveMarkup = /<(button|a|input|select|form)\b/i.test(htmlCode);
  const hasLeakWrapper = /<\s*(?:!DOCTYPE|html|head|body)\b/i.test(htmlCode);
  const structureOk =
    hasHeading &&
    hasNavOrHeader &&
    hasSectionOrMain &&
    hasInteractiveMarkup &&
    !hasLeakWrapper &&
    htmlCode.length >= 250;

  const missing: string[] = [];
  if (!hasHeading) missing.push('h1/h2 heading');
  if (!hasNavOrHeader) missing.push('header/nav');
  if (!hasSectionOrMain) missing.push('main/section');
  if (!hasInteractiveMarkup) missing.push('interactive controls');
  if (hasLeakWrapper) missing.push('strip html/head/body wrapper tags');
  if (htmlCode.length < 250) missing.push('too sparse');

  checks.push({
    id: 'structure',
    label: 'Semantic structure & completeness',
    passed: structureOk,
    detail: structureOk
      ? 'Semantic header/nav, sections, headings, and interactive elements present.'
      : `Issues: ${missing.join(', ')}`,
  });

  // 2. Design system & typography tokens
  const hasCssVars = cssCode.includes('--');
  const hasFontRule = /font-family/i.test(cssCode);
  const fontSizeMatches = cssCode.match(/font-size\s*:/gi)?.length ?? 0;
  const hasScaleHierarchy =
    /clamp\(/i.test(cssCode) || /rem/i.test(cssCode) || fontSizeMatches >= 3;
  const typographyOk = hasCssVars && hasFontRule && hasScaleHierarchy && cssCode.length >= 300;
  checks.push({
    id: 'typography_tokens',
    label: 'Typography & color token system',
    passed: typographyOk,
    detail: typographyOk
      ? 'CSS custom properties, intentional font-family, and typographic scale found.'
      : 'Missing CSS custom properties (--tokens), font-family pairing, or clear typographic hierarchy.',
  });

  // 3. Mobile & responsive layout
  const hasMediaOrFluidGrid =
    /@media/i.test(cssCode) ||
    /auto-fit/i.test(cssCode) ||
    /auto-fill/i.test(cssCode) ||
    /clamp\(/i.test(cssCode);
  const hasHugeFixedWidth = FIXED_HUGE_WIDTH_REGEX.test(cssCode);
  const responsiveOk = hasMediaOrFluidGrid && !hasHugeFixedWidth;
  checks.push({
    id: 'responsive_layout',
    label: 'Mobile & responsive layout',
    passed: responsiveOk,
    detail: responsiveOk
      ? 'Responsive breakpoints / fluid grid present without fixed desktop-only widths.'
      : hasHugeFixedWidth
      ? 'Detected fixed wide pixel width (>900px) that can break mobile viewports.'
      : 'Missing @media queries or fluid CSS Grid/Flexbox rules for mobile responsiveness.',
  });

  // 4. Self-contained visuals & authentic copy
  const hasExternalImages = EXTERNAL_BROKEN_IMG_REGEX.test(htmlCode);
  const lowerPromptForImages = prompt.toLowerCase();
  const expectsCommerceImages = /\b(online shop|online store|e-?commerce|storefront|product catalog|product catalogue|product listing|shop|store|retail|marketplace|electronics|gadgets|fashion|clothing|apparel|food|restaurant|restaurants|cafe|cafes|bakery|food truck|catering|menu)\b/.test(lowerPromptForImages);
  const imageTags = Array.from(htmlCode.matchAll(/<img\b[^>]*>/gi), (match) => match[0]);
  const visibleImageUrls = imageTags.map((tag) => /\bsrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] ?? '').filter(Boolean);
  const hasVisibleImages = visibleImageUrls.length > 0;
  const hasMissingImageAlt = imageTags.some((tag) => !/\balt\s*=\s*["'][^"']+["']/i.test(tag));
  const hasPlaceholderCopy = PLACEHOLDER_TEXT_REGEX.test(htmlCode);
  const assetsOk = !hasExternalImages && !hasPlaceholderCopy && !hasMissingImageAlt && (!expectsCommerceImages || hasVisibleImages);
  checks.push({
    id: 'assets_and_copy',
    label: 'Self-contained visuals & authentic copy',
    passed: assetsOk,
    detail: hasExternalImages
      ? 'Contains external http(s) <img> URLs that may fail offline; replace with crisp inline SVGs.'
      : hasPlaceholderCopy
      ? 'Contains placeholder/Lorem Ipsum copy; replace with domain-authentic copy.'
      : hasMissingImageAlt
      ? 'One or more images are missing descriptive alt text.'
      : expectsCommerceImages && !hasVisibleImages
      ? 'Commerce or hospitality page is missing visible relevant imagery.'
      : 'Uses visible imagery with descriptive alt text and realistic domain copy.',
  });

  // 5. JavaScript interactivity & syntax integrity
  const hasJsListeners =
    /addEventListener/i.test(jsCode) ||
    /onclick/i.test(jsCode) ||
    /onclick=/i.test(htmlCode);
  const usesBrowserDialogStubs = /\b(alert|confirm|prompt)\s*\(/.test(jsCode);
  const balancedSyntax = hasBalancedDelimiters(jsCode);
  const jsOk = jsCode.trim().length > 0 && hasJsListeners && balancedSyntax && !usesBrowserDialogStubs;
  checks.push({
    id: 'interactivity_js',
    label: 'Functional JS & syntax integrity',
    passed: jsOk,
    detail: !balancedSyntax
      ? 'Unbalanced braces, brackets, or parentheses detected in app.js.'
      : usesBrowserDialogStubs
      ? 'Avoid native alert()/confirm()/prompt(); render in-page modals or toast feedback.'
      : !hasJsListeners
      ? 'No interactive event listeners found in app.js.'
      : 'Balanced JavaScript syntax with active event listeners and clean UI feedback.',
  });

  // 6. Industry, manual-payment preference & Kenyan context alignment
  const lowerPrompt = prompt.toLowerCase();
  const expectsKenyan =
    KENYAN_PROMPT_KEYWORDS.some((kw) => lowerPrompt.includes(kw)) ||
    lowerPrompt.includes('till') ||
    lowerPrompt.includes('paybill');
  const prefersManualPayment =
    lowerPrompt.includes('manual payment') ||
    lowerPrompt.includes('manual m-pesa') ||
    lowerPrompt.includes('manual mpesa') ||
    lowerPrompt.includes('no daraja') ||
    lowerPrompt.includes('without daraja') ||
    (lowerPrompt.includes("don't have") && lowerPrompt.includes('daraja'));
  const combinedOutput = `${htmlCode}\n${jsCode}`.toLowerCase();
  const hasKenyanSignals =
    combinedOutput.includes('ksh') ||
    combinedOutput.includes('+254') ||
    combinedOutput.includes('m-pesa') ||
    combinedOutput.includes('mpesa') ||
    combinedOutput.includes('till') ||
    combinedOutput.includes('paybill') ||
    combinedOutput.includes('nairobi');
  const claimsAutomaticDaraja =
    combinedOutput.includes('stk push') ||
    combinedOutput.includes('daraja api') ||
    combinedOutput.includes('lipa na m-pesa online');

  let contextOk = true;
  if (prefersManualPayment && claimsAutomaticDaraja) contextOk = false;
  else if (expectsKenyan) contextOk = hasKenyanSignals;
  else contextOk = !combinedOutput.includes('m-pesa') && !combinedOutput.includes('+254');

  checks.push({
    id: 'market_context',
    label: 'Industry & market relevance',
    passed: contextOk,
    detail:
      prefersManualPayment && claimsAutomaticDaraja
        ? 'User requested manual payments without Safaricom Daraja, but output mentions automatic STK Push / Daraja API.'
        : contextOk && expectsKenyan
        ? 'Kenyan context (KSh / +254 / manual M-Pesa Till or Paybill) applied naturally.'
        : contextOk
        ? 'Market context matches the requested audience without unrelated localization.'
        : expectsKenyan
        ? 'Prompt implies Kenyan business context but output lacks local cues (KSh, +254, Till/Paybill).'
        : 'Unrequested Kenyan-specific payment/phone details injected into a non-Kenyan project.',
  });

  const failedChecks = checks.filter((c) => !c.passed);
  const passedCount = checks.length - failedChecks.length;
  const totalCount = checks.length;
  const allPassed = failedChecks.length === 0;
  const conciseSummary =
    `QA Audit (${passedCount}/${totalCount} checks passed)` +
    (failedChecks.length > 0
      ? `: needs attention on ${failedChecks.map((c) => c.label).join('; ')}`
      : ': structure, typography, responsive CSS, self-contained assets, JS syntax, and market context verified.');

  return {
    checks,
    passedCount,
    totalCount,
    failedChecks,
    allPassed,
    conciseSummary,
  };
}
