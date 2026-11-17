import type { AppProject, GeneratedAppBundle, ProjectMessage, TemplateType } from '../types/project';
import { getTemplateDisplayName } from '../types/project';
import { extractBodyIfFullDocument } from '../utils/webBundleAssembler';
import { auditGeneratedBundle } from './webQualityValidator';

const USER_GEMINI_KEY_STORAGE = 'craftable_user_gemini_key';

const SYSTEM_PROMPT = `You are Craft AI, a principal product designer and senior front-end engineer inside Craftable.

RULE #0 — STRICTLY OBEY THE USER'S PROMPT:
- Build or edit EXACTLY what the user asks for: their exact app concept, business name, pages, sections, controls, colors, and workflows.
- NEVER ignore the user's request or substitute a generic or unrelated app.

1. MANUAL PAYMENTS & KENYAN CONTEXT:
- Unless the user explicitly asks for Safaricom Daraja API integration, ALWAYS implement MANUAL M-Pesa payments when checkout/payment is needed: show Buy Goods Till / Paybill + Account number with a Copy button, KSh total, customer phone (+254 / 07XX) and M-Pesa Confirmation Code input, plus an owner verification view ("Pending Verification" -> "Confirm Payment"). Never fake automatic STK Push when manual payments are requested.
- Only include Kenyan cues (KSh, +254, M-Pesa) when relevant to a Kenyan/East African request or asked by the user.

2. DESIGN & ENGINEERING QUALITY:
- Crisp, spacious mobile-first UI: :root CSS custom properties (--bg, --surface, --ink, --muted, --accent, --border), intentional typography pairing, 16px+ readable body text, large clickable buttons (min-height: 44px), and fluid widths (max-width, never fixed widths > 900px).
- Self-contained: NO external http(s) <img> URLs or CDN scripts; use crisp inline SVGs. Wire all buttons, forms, tabs, modals, and localStorage state with real vanilla JS event listeners. Never use alert(), confirm(), or prompt().
- HTML section must contain ONLY inner <body> markup (no <!DOCTYPE>, <html>, <head>, <body>, <style>, or <script> tags).

3. REQUIRED OUTPUT FORMAT (use these exact section markers):
<<<TITLE>>>
2 to 4 word project title
<<<DESCRIPTION>>>
One concise sentence describing the app
<<<SUMMARY>>>
Friendly 2-sentence explanation of what you built, changed, or answered for the user
<<<HTML>>>
Inner <body> HTML markup
<<<CSS>>>
Complete CSS stylesheet
<<<JS>>>
Complete vanilla JavaScript
<<<SUGGESTIONS>>>
Suggestion 1 | Suggestion 2 | Suggestion 3`;

export function getSavedUserApiKey(): string {
  try {
    return localStorage.getItem(USER_GEMINI_KEY_STORAGE)?.trim() ?? '';
  } catch {
    return '';
  }
}

export function saveUserApiKey(key: string): void {
  const cleaned = key.trim();
  if (!cleaned) {
    localStorage.removeItem(USER_GEMINI_KEY_STORAGE);
  } else {
    localStorage.setItem(USER_GEMINI_KEY_STORAGE, cleaned);
  }
}

function stripCodeFence(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('```')) {
    const firstNewline = text.indexOf('\n');
    if (firstNewline > 0) {
      text = text.slice(firstNewline + 1);
    }
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3);
  }
  return text.trim();
}

function extractTag(text: string, tagName: string): string {
  const regex = new RegExp(
    `<<<${tagName}>>>([\\s\\S]*?)(?=<<<(?:TITLE|DESCRIPTION|SUMMARY|HTML|CSS|JS|SUGGESTIONS)>>>|$)`,
    'i'
  );
  return regex.exec(text)?.[1]?.trim() ?? '';
}

function parseBundleJson(
  jsonText: string,
  existingFallback: GeneratedAppBundle | null
): GeneratedAppBundle | null {
  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const str = (key: string, def = '') =>
      typeof parsed[key] === 'string' ? (parsed[key] as string) : def;
    const htmlCode = extractBodyIfFullDocument(str('htmlCode')).trim() || existingFallback?.htmlCode || '';
    if (!htmlCode) return null;

    const changedFiles = Array.isArray(parsed.changedFiles)
      ? parsed.changedFiles.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      : ['index.html', 'styles.css', 'app.js'];

    const followUpSuggestions = Array.isArray(parsed.followUpSuggestions)
      ? parsed.followUpSuggestions
          .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
          .slice(0, 3)
      : ['Add manual M-Pesa Till payment', 'Make buttons & text larger', 'Refine layout & polish'];

    return {
      projectTitle: str('projectTitle', existingFallback?.projectTitle ?? 'Crafted App') || 'Crafted App',
      description: str('description', existingFallback?.description ?? 'Interactive web app crafted by Craft AI'),
      summary: str('summary', 'Crafted your interactive web application.'),
      htmlCode,
      cssCode: str('cssCode') || existingFallback?.cssCode || '',
      jsCode: str('jsCode') || existingFallback?.jsCode || '',
      changedFiles,
      followUpSuggestions,
    };
  } catch {
    return null;
  }
}

export function parseCraftAiResponse(
  rawText: string,
  existingFallback: GeneratedAppBundle | null
): GeneratedAppBundle {
  const cleaned = rawText.trim();

  if (
    /<<<SUMMARY>>>/i.test(cleaned) ||
    /<<<HTML>>>/i.test(cleaned) ||
    /<<<TITLE>>>/i.test(cleaned)
  ) {
    const title = extractTag(cleaned, 'TITLE') || existingFallback?.projectTitle || 'Crafted App';
    const description =
      extractTag(cleaned, 'DESCRIPTION') ||
      existingFallback?.description ||
      'Interactive web app crafted by Craft AI';
    const summary = extractTag(cleaned, 'SUMMARY') || 'Updated your application as requested.';
    const parsedHtml = stripCodeFence(extractTag(cleaned, 'HTML'));
    const parsedCss = stripCodeFence(extractTag(cleaned, 'CSS'));
    const parsedJs = stripCodeFence(extractTag(cleaned, 'JS'));
    const suggestionsRaw = extractTag(cleaned, 'SUGGESTIONS');
    const suggestions = suggestionsRaw
      .split(/[|\n]/)
      .map((s) => s.trim().replace(/^[-*]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);

    const finalHtml =
      (parsedHtml ? extractBodyIfFullDocument(parsedHtml) : '') || existingFallback?.htmlCode || '';
    const finalCss = parsedCss || existingFallback?.cssCode || '';
    const finalJs = parsedJs || existingFallback?.jsCode || '';

    if (finalHtml) {
      const changed: string[] = [];
      if (parsedHtml) changed.push('index.html');
      if (parsedCss) changed.push('styles.css');
      if (parsedJs) changed.push('app.js');

      return {
        projectTitle: title.slice(0, 80),
        description: description.slice(0, 300),
        summary,
        htmlCode: finalHtml,
        cssCode: finalCss,
        jsCode: finalJs,
        changedFiles: changed,
        followUpSuggestions:
          suggestions.length > 0
            ? suggestions
            : ['Add manual M-Pesa Till payment', 'Make buttons & text larger', 'Refine layout & polish'],
      };
    }
  }

  const strippedForJson = stripCodeFence(cleaned);
  if (strippedForJson.startsWith('{') && strippedForJson.endsWith('}')) {
    const jsonBundle = parseBundleJson(strippedForJson, existingFallback);
    if (jsonBundle) return jsonBundle;
  }

  if (/<(html|body|section|main)\b/i.test(cleaned)) {
    const cleanedHtml = stripCodeFence(cleaned);
    const extractedStyle = /<style[^>]*>([\s\S]*?)<\/style>/i.exec(cleanedHtml)?.[1]?.trim() ?? '';
    const extractedScript = /<script[^>]*>([\s\S]*?)<\/script>/i.exec(cleanedHtml)?.[1]?.trim() ?? '';
    const bodyOnly = extractBodyIfFullDocument(
      cleanedHtml
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    );

    if (bodyOnly) {
      return {
        projectTitle: existingFallback?.projectTitle ?? 'Crafted App',
        description: existingFallback?.description ?? 'Interactive web application',
        summary: 'Built your application from your prompt.',
        htmlCode: bodyOnly,
        cssCode: extractedStyle || existingFallback?.cssCode || '',
        jsCode: extractedScript || existingFallback?.jsCode || '',
        changedFiles: ['index.html', 'styles.css', 'app.js'],
        followUpSuggestions: ['Add manual M-Pesa Till payment', 'Make buttons & text larger', 'Refine layout & polish'],
      };
    }
  }

  if (existingFallback && cleaned) {
    return {
      ...existingFallback,
      summary: cleaned.slice(0, 1500),
      changedFiles: [],
    };
  }

  throw new Error('Craft AI response was incomplete. Please tap Retry.');
}

async function callBrowserGeminiDirect(
  apiKey: string,
  promptText: string,
  onStageUpdate: (stage: string) => void
): Promise<string> {
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;
  let lastError = 'Craft AI failed to respond.';

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    if (i > 0) {
      onStageUpdate('Switching to fast Craft AI engine...');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.45 },
          }),
        }
      );

      clearTimeout(timer);

      const payload = (await response.json().catch(() => null)) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      } | null;

      if (!response.ok) {
        lastError = payload?.error?.message || `Craft AI returned HTTP ${response.status}`;
        if (response.status === 401 || response.status === 403 || response.status === 400) {
          throw new Error(lastError);
        }
        continue;
      }

      const text =
        payload?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? '')
          .join('')
          .trim() ?? '';
      if (text) return text;
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        lastError = 'Craft AI took longer than 45s to respond. Please tap Retry.';
      } else {
        lastError = err instanceof Error ? err.message : 'Network error calling Craft AI.';
      }
      if (lastError.includes('API key') || lastError.includes('HTTP 403') || lastError.includes('HTTP 401')) {
        throw new Error(lastError);
      }
    }
  }

  throw new Error(lastError);
}

async function executeCraftRequest(
  promptText: string,
  onStageUpdate: (stage: string) => void
): Promise<string> {
  onStageUpdate('Connecting to Craft AI...');
  const userKey = getSavedUserApiKey();

  // 1. Prefer Vercel serverless /api/craft when deployed
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 48_000);
    onStageUpdate('Craft AI is writing code...');
    const res = await fetch('/api/craft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ promptText, systemPrompt: SYSTEM_PROMPT }),
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = (await res.json()) as { text?: string };
      if (data.text) return data.text;
    } else {
      const errBody = (await res.json().catch(() => null)) as { code?: string; error?: string } | null;
      const missingServerRouteOrKey =
        res.status === 404 || res.status === 405 || errBody?.code === 'MISSING_SERVER_KEY';

      if (missingServerRouteOrKey && userKey) {
        return await callBrowserGeminiDirect(userKey, promptText, onStageUpdate);
      }

      if (missingServerRouteOrKey && !userKey) {
        throw new Error(
          'Craft AI key is not connected yet. Click the Craft AI pill in the top bar to paste your Gemini API key, or set GEMINI_API_KEY in Vercel Environment Variables.'
        );
      }

      throw new Error(errBody?.error || `Craft AI error (HTTP ${res.status}).`);
    }
  } catch (err) {
    if (userKey && err instanceof TypeError) {
      return await callBrowserGeminiDirect(userKey, promptText, onStageUpdate);
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Craft AI took too long to respond. Please tap Retry.');
    }
    throw err instanceof Error ? err : new Error('Failed to reach Craft AI.');
  }

  if (userKey) {
    return await callBrowserGeminiDirect(userKey, promptText, onStageUpdate);
  }
  throw new Error('Craft AI did not return a response.');
}

function finalizeBundle(
  userRequest: string,
  bundle: GeneratedAppBundle,
  existingFallback: GeneratedAppBundle | null,
  onStageUpdate: (stage: string) => void
): GeneratedAppBundle {
  const didUpdateCode =
    !existingFallback ||
    bundle.htmlCode !== existingFallback.htmlCode ||
    bundle.cssCode !== existingFallback.cssCode ||
    bundle.jsCode !== existingFallback.jsCode;

  if (!didUpdateCode) {
    return { ...bundle, changedFiles: [] };
  }

  onStageUpdate('Checking code quality...');
  const audit = auditGeneratedBundle(userRequest, bundle.htmlCode, bundle.cssCode, bundle.jsCode);
  const fullSummary = bundle.summary.trim()
    ? `${bundle.summary.trim()}\n\n${audit.conciseSummary}`
    : audit.conciseSummary;

  return {
    ...bundle,
    summary: fullSummary,
    qaSummary: audit.conciseSummary,
  };
}

export async function generateNewApp(
  prompt: string,
  templateType: TemplateType,
  onStageUpdate: (stage: string) => void = () => {}
): Promise<GeneratedAppBundle> {
  const fullPrompt = [
    'BUILD EXACTLY THIS APP:',
    `"${prompt}"`,
    '',
    `Category hint: ${getTemplateDisplayName(templateType)} (follow the user's prompt 100%).`,
    'Output all sections using <<<TITLE>>>, <<<DESCRIPTION>>>, <<<SUMMARY>>>, <<<HTML>>>, <<<CSS>>>, <<<JS>>>, and <<<SUGGESTIONS>>>.',
  ].join('\n');

  const rawText = await executeCraftRequest(fullPrompt, onStageUpdate);
  const bundle = parseCraftAiResponse(rawText, null);
  return finalizeBundle(prompt, bundle, null, onStageUpdate);
}

export async function iterateExistingApp(
  project: AppProject,
  userPrompt: string,
  recentMessages: ProjectMessage[],
  activeHtml: string,
  activeCss: string,
  activeJs: string,
  onStageUpdate: (stage: string) => void = () => {}
): Promise<GeneratedAppBundle> {
  const historyTail = recentMessages.slice(-6);
  const lines: string[] = [
    `EXISTING PROJECT: "${project.title}" (v${project.version})`,
    `Original prompt: ${project.initialPrompt}`,
  ];

  if (historyTail.length > 0) {
    lines.push('', 'Recent conversation:');
    historyTail.forEach((msg) => {
      const speaker = msg.role === 'user' ? 'USER' : 'ASSISTANT';
      lines.push(`- ${speaker}: ${msg.content.slice(0, 260)}`);
    });
  }

  lines.push(
    '',
    'USER REQUEST NOW:',
    `"${userPrompt}"`,
    '',
    'If the user is asking for edits or new features, apply them faithfully and output updated <<<TITLE>>>, <<<DESCRIPTION>>>, <<<SUMMARY>>>, <<<HTML>>>, <<<CSS>>>, <<<JS>>>, <<<SUGGESTIONS>>>.',
    'If the user is only asking a question or greeting without requesting code changes, answer clearly in <<<SUMMARY>>>.',
    '',
    'Current HTML:',
    activeHtml.slice(0, 12_000),
    '',
    'Current CSS:',
    activeCss.slice(0, 9_000),
    '',
    'Current JS:',
    activeJs.slice(0, 12_000)
  );

  const existingFallback: GeneratedAppBundle = {
    projectTitle: project.title,
    description: project.description,
    summary: '',
    htmlCode: activeHtml,
    cssCode: activeCss,
    jsCode: activeJs,
    changedFiles: [],
    followUpSuggestions: [
      'Add manual M-Pesa Till checkout',
      'Make buttons & text larger',
      'Refine layout & visual polish',
    ],
  };

  const rawText = await executeCraftRequest(lines.join('\n'), onStageUpdate);
  const bundle = parseCraftAiResponse(rawText, existingFallback);
  return finalizeBundle(`${project.initialPrompt}\n${userPrompt}`, bundle, existingFallback, onStageUpdate);
}
