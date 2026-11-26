import type {
  AppProject,
  DesignTemplate,
  GeneratedAppBundle,
  ProjectMessage,
  PromptAttachment,
  TemplateType,
} from '../types/project';
import { getTemplateDisplayName } from '../types/project';
import { serializeAttachmentsForApi } from '../utils/attachmentReader';
import { extractBodyIfFullDocument } from '../utils/webBundleAssembler';
import { auditGeneratedBundle } from './webQualityValidator';

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
  onStageUpdate: (stage: string) => void,
  attachments?: PromptAttachment[]
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
      body: JSON.stringify({
        mode: 'build',
        promptText,
        attachments: serializeAttachmentsForApi(attachments),
      }),
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
          'Zuno AI server keys are not configured yet. Site owners can add your Groq API key in Owner Admin (/admin).'
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
  onStageUpdate: (stage: string) => void = () => {},
  attachments?: PromptAttachment[]
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

  const rawText = await executeZunoServerRequest(lines.join('\n'), onStageUpdate, attachments);
  const bundle = parseCraftAiResponse(rawText, null);
  return finalizeBundle(prompt, bundle, null, onStageUpdate);
}

async function executeZunoProjectChat(promptText: string, onStageUpdate: (stage: string) => void): Promise<string> {
  onStageUpdate('Zuno AI is answering...');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 54_000);
  try {
    const res = await fetch('/api/craft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ mode: 'project_chat', promptText }),
    });
    const data = (await res.json().catch(() => null)) as { text?: string; error?: string } | null;
    if (!res.ok) throw new Error(data?.error || 'Zuno could not answer just now. Please try again.');
    const answer = data?.text?.trim();
    if (!answer) throw new Error('Zuno returned an empty answer. Please try again.');
    return answer;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new Error('Zuno took too long to reply. Please retry.');
    throw err instanceof Error ? err : new Error('Failed to reach Zuno.');
  } finally {
    clearTimeout(timer);
  }
}

function shouldKeepProjectRequestInChat(prompt: string): boolean {
  const value = prompt.trim().toLowerCase();
  if (!value) return true;

  // Questions and feedback requests are never permission to mutate a project,
  // even when they contain words such as "change", "add", or "make".
  if (/[?]$/.test(value) ||
      /^(what|where|when|why|how|which|who|is|are|was|were|do|does|did|can you explain|could you explain|tell me|explain|what do you think|how does)\\b/.test(value)) {
    return true;
  }

  // A safe edit needs BOTH an action and an identifiable target. Vague requests
  // like "make it more premium" stay in chat instead of silently rebuilding.
  const hasEditAction = /\\b(add|build|create|change|edit|fix|insert|modify|move|remove|replace|redesign|update|rewrite|implement|put|include|generate|swap|resize|shorten|lengthen|increase|decrease|set)\\b/.test(value);
  const hasTarget = /\\b(whole site|entire site|website|site|page|hero|headline|heading|title|subtitle|copy|text|button|cta|header|navigation|nav|footer|section|image|photo|product|card|background|colour|color|font|typography|spacing|padding|margin|layout|grid|search|filter|price|logo|menu|payment|checkout)\\b/.test(value);

  return !(hasEditAction && hasTarget);
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
  if (shouldKeepProjectRequestInChat(userPrompt)) {
    const imageCount = (activeHtml.match(/<img\b/gi) ?? []).length;
    const questionContext = [
      'The request is not a clearly scoped edit to the EXISTING website project. Keep this turn conversational and do not mutate project state.',
      'Answer genuine questions directly. If the user gave a vague change request, ask exactly one concise clarifying question about the target or intended result.',
      'Do not generate code, modify the project, add features, create extra pages, or suggest unrelated integrations.',
      `Project title: ${project.title}`,
      `Original brief: ${project.initialPrompt.slice(0, 1800)}`,
      `Current page has ${imageCount} image element(s).`,
      'Current page HTML excerpt:',
      activeHtml.slice(0, 6500),
      '',
      'User question:',
      userPrompt,
    ].join('\n');
    const answer = await executeZunoProjectChat(questionContext, onStageUpdate);
    return {
      projectTitle: project.title,
      description: project.description,
      summary: answer,
      htmlCode: activeHtml,
      cssCode: activeCss,
      jsCode: activeJs,
      changedFiles: [],
      followUpSuggestions: [],
    };
  }

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
