import type {
  AppProject,
  DesignTemplate,
  GeneratedAppBundle,
  ProjectMessage,
  TemplateType,
} from '../types/project';
import { getTemplateDisplayName } from '../types/project';
import { extractBodyIfFullDocument } from '../utils/webBundleAssembler';
import { auditGeneratedBundle } from './webQualityValidator';

const SYSTEM_PROMPT = `You are Zuno AI, a principal product designer and senior front-end engineer inside Zuno AI (an AI platform where users create custom websites, web apps, and 3D games).

RULE #0 — STRICTLY OBEY THE USER'S PROMPT:
- Build or edit EXACTLY what the user asks for: their exact website, business name, pages, sections, controls, colors, game mechanics, and workflows.
- NEVER ignore the user's request or substitute a generic or unrelated app.

1. MANUAL PAYMENTS & KENYAN CONTEXT:
- Unless the user explicitly asks for Safaricom Daraja API integration, ALWAYS implement MANUAL M-Pesa payments when checkout/payment is needed: show Buy Goods Till / Paybill + Account number with a Copy button, KSh total, customer phone (+254 / 07XX) and M-Pesa Confirmation Code input, plus an owner verification view ("Pending Verification" -> "Confirm Payment"). Never fake automatic STK Push when manual payments are requested.
- Only include Kenyan cues (KSh, +254, M-Pesa) when relevant to a Kenyan/East African request or asked by the user.

2. DESIGN & ENGINEERING QUALITY:
- Crisp, spacious mobile-first UI: :root CSS custom properties (--bg, --surface, --ink, --muted, --accent, --border), intentional typography pairing, 16px+ readable body text, large clickable buttons (min-height: 44px), and fluid widths (max-width, never fixed widths > 900px).
- Self-contained: NO external http(s) <img> URLs or external CDN scripts; use crisp inline SVGs or HTML5 Canvas/WebGL. Wire all buttons, forms, tabs, modals, and localStorage state with real vanilla JS event listeners. Never use alert(), confirm(), or prompt().
- HTML section must contain ONLY inner <body> markup (no <!DOCTYPE>, <html>, <head>, <body>, <style>, or <script> tags).
- When building or editing a 3D game (platformer/obby, endless runner, space shooter, or block/puzzle game): render true perspective 3D projection or WebGL with depth-sorted shaded 3D faces, directional lighting & horizon fog, animated 3D characters/meshes, 3D particle bursts, floating score popups, camera shake, frosted glassmorphic HUD (Score, Best, Lives/Level), polished Start/Pause/Game Over cards, responsive 16:10 canvas, and both keyboard (WASD/Arrows/Space/P) + mobile touch controls.

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

export interface ServerAiStatus {
  ready: boolean;
  aiName: string;
}

export async function checkServerAiStatus(): Promise<ServerAiStatus> {
  try {
    const res = await fetch('/api/craft', { method: 'GET', cache: 'no-store' });
    if (!res.ok) return { ready: false, aiName: 'Zuno AI' };
    const data = (await res.json()) as { ready?: boolean; aiName?: string };
    return {
      ready: Boolean(data.ready),
      aiName: data.aiName || 'Zuno AI',
    };
  } catch {
    return { ready: false, aiName: 'Zuno AI' };
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
      : ['Refine visual polish', 'Make buttons & text larger', 'Add interactive sections'];

    return {
      projectTitle: str('projectTitle', existingFallback?.projectTitle ?? 'Zuno App') || 'Zuno App',
      description: str('description', existingFallback?.description ?? 'Interactive web app built by Zuno AI'),
      summary: str('summary', 'Built your interactive web application with Zuno AI.'),
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
    const title = extractTag(cleaned, 'TITLE') || existingFallback?.projectTitle || 'Zuno App';
    const description =
      extractTag(cleaned, 'DESCRIPTION') ||
      existingFallback?.description ||
      'Interactive web app built by Zuno AI';
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
            : ['Add more interactive features', 'Make buttons & text larger', 'Refine layout & polish'],
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
        projectTitle: existingFallback?.projectTitle ?? 'Zuno App',
        description: existingFallback?.description ?? 'Interactive web application',
        summary: 'Built your application from your prompt.',
        htmlCode: bodyOnly,
        cssCode: extractedStyle || existingFallback?.cssCode || '',
        jsCode: extractedScript || existingFallback?.jsCode || '',
        changedFiles: ['index.html', 'styles.css', 'app.js'],
        followUpSuggestions: ['Add more interactive features', 'Make buttons & text larger', 'Refine layout & polish'],
      };
    }
  }

  if (existingFallback && cleaned) {
    return {
      ...existingFallback,
      summary: cleaned.slice(0, 1800),
      changedFiles: [],
    };
  }

  throw new Error('Zuno AI response was incomplete. Please tap Retry.');
}

async function executeZunoServerRequest(
  promptText: string,
  onStageUpdate: (stage: string) => void
): Promise<string> {
  onStageUpdate('Connecting to Zuno AI...');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 54_000);
  try {
    onStageUpdate('Zuno AI is building...');
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
      throw new Error('Zuno AI returned an empty response. Please tap Retry.');
    }

    const errBody = (await res.json().catch(() => null)) as { code?: string; error?: string } | null;
    if (res.status === 503 || errBody?.code === 'MISSING_SERVER_KEY') {
      throw new Error(
        errBody?.error ||
          'Zuno AI server keys are not configured yet. Site owners can add Gemini keys in Admin Control (/admin).'
      );
    }
    throw new Error(errBody?.error || `Zuno AI server error (HTTP ${res.status}).`);
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Zuno AI took too long to respond. Please tap Retry.');
    }
    throw err instanceof Error ? err : new Error('Failed to reach Zuno AI server.');
  }
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

  onStageUpdate('Running quality checks...');
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
  blueprintTemplate: DesignTemplate | null = null,
  onStageUpdate: (stage: string) => void = () => {}
): Promise<GeneratedAppBundle> {
  const lines: string[] = [
    'BUILD EXACTLY THIS WEBSITE / APP / GAME:',
    `"${prompt}"`,
    '',
    `Category hint: ${getTemplateDisplayName(templateType)} (follow the user's prompt 100%).`,
  ];

  if (blueprintTemplate) {
    lines.push(
      '',
      `SELECTED AI LIBRARY BLUEPRINT (${blueprintTemplate.name} — ${blueprintTemplate.badgeLabel}):`,
      `- Visual Direction: ${blueprintTemplate.visualDirection}`,
      `- Color System: ${blueprintTemplate.colorSystem}`,
      `- Typography Pairing: ${blueprintTemplate.typographyPairing}`,
      `- Layout Blueprint: ${blueprintTemplate.layoutBlueprint}`,
      `- Interactive Patterns: ${blueprintTemplate.interactivePatterns}`,
      'Use this template foundation to design and code the user request above with tailored copy, colors, and interactive features.'
    );
  }

  lines.push(
    '',
    'Output all sections using <<<TITLE>>>, <<<DESCRIPTION>>>, <<<SUMMARY>>>, <<<HTML>>>, <<<CSS>>>, <<<JS>>>, and <<<SUGGESTIONS>>>.'
  );

  const rawText = await executeZunoServerRequest(lines.join('\n'), onStageUpdate);
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
    'If the user is asking for edits, redesigns, or new features, apply them faithfully and output updated <<<TITLE>>>, <<<DESCRIPTION>>>, <<<SUMMARY>>>, <<<HTML>>>, <<<CSS>>>, <<<JS>>>, <<<SUGGESTIONS>>>.',
    'If the user is chatting or asking a question without requesting code changes, reply helpfully inside <<<SUMMARY>>>.',
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
      'Make the layout cleaner',
      'Make buttons & text larger',
      'Add another interactive section',
    ],
  };

  const rawText = await executeZunoServerRequest(lines.join('\n'), onStageUpdate);
  const bundle = parseCraftAiResponse(rawText, existingFallback);
  return finalizeBundle(`${project.initialPrompt}\n${userPrompt}`, bundle, existingFallback, onStageUpdate);
}
