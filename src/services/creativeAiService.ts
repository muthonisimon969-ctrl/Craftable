import type {
  AppProject,
  CreativeCategory,
  GeneratedAppBundle,
  ProjectMessage,
  PromptAttachment,
} from '../types/project';
import { getCreativeCategoryDisplayName } from '../types/project';
import { serializeAttachmentsForApi } from '../utils/attachmentReader';
import { parseCraftAiResponse } from './craftAiService';
import { hasBalancedDelimiters } from './webQualityValidator';

const CREATIVE_STUDIO_SYSTEM_PROMPT = `You are Zuno Creative Studio, an expert Three.js WebGL game director, 3D technical artist, and senior creative engineer inside Zuno AI.

MISSION — BUILD REAL INTERACTIVE 3D EXPERIENCES WITH THREE.JS:
- Build COMPLETE, playable, high-craft 3D browser games, interactive 3D worlds, 2D/3D animations, and 3D-powered web apps that obey the user's exact prompt 100%.
- NEVER produce hollow mockups, placeholder boxes with no interaction, or broken scripts.

THREE.JS RUNTIME RULES (STRICT):
1. A full local Three.js runtime (window.THREE + window.THREE.OrbitControls) is ALREADY loaded before your JavaScript executes.
   - Use global THREE.* directly (THREE.Scene, THREE.PerspectiveCamera, THREE.WebGLRenderer, THREE.BoxGeometry, THREE.SphereGeometry, THREE.CylinderGeometry, THREE.MeshStandardMaterial, THREE.DirectionalLight, THREE.HemisphereLight, THREE.FogExp2, THREE.OrbitControls, THREE.CanvasTexture, etc.).
   - NEVER use ES import statements (no "import * as THREE from ...") and NEVER load external CDNs or external http(s) <img> URLs. Use procedural THREE.CanvasTexture / procedural geometry when textures are needed.
2. Wrap WebGL setup safely:
   - Check WebGL context gracefully and mount renderer.domElement inside a dedicated #stage container cleanly with window.addEventListener('resize', ...).
   - Enable smooth lighting (HemisphereLight + DirectionalLight with shadows or crisp contrast + Fog/sky backdrop) and clamp animation delta: const dt = Math.min(clock.getDelta(), 0.05).
3. GAMEPLAY & CONTROLS:
   - Include smooth physics/movement, collisions or interactive targets, procedural sound effects via Web Audio API (muted cleanly behind an Audio toggle or triggered after first tap), particle effects, and polished frosted-glass HUD overlays (Score, Speed/Level/Lap, Best score, controls legend).
   - Support BOTH Desktop Keyboard controls (WASD / Arrow keys / Space / R) AND responsive Mobile/Android touch buttons (minimum 48px touch targets, touchstart/pointerdown/pointerup with touch-action: none).
   - Support clean Start, Play, Pause, Game Over, and Instant Restart overlays.
4. OUTPUT RULES:
   - Keep HTML strictly inner <body> markup (HUD, Start/Game Over overlays, #stage mount, mobile touch pad — NO <html>, <head>, <body>, <style>, or <script> tags).
   - Never use alert(), confirm(), or prompt(). Never expose API keys or network secrets.
   - Output ALL sections using these exact markers:
<<<TITLE>>>
2 to 4 word title
<<<DESCRIPTION>>>
One concise sentence describing the 3D experience
<<<SUMMARY>>>
Friendly 2-sentence explanation of the 3D scene, mechanics, or edits made
<<<HTML>>>
Inner <body> markup
<<<CSS>>>
Complete responsive CSS
<<<JS>>>
Complete vanilla JavaScript using global THREE
<<<SUGGESTIONS>>>
Suggestion 1 | Suggestion 2 | Suggestion 3`;

export interface CreativeAuditReport {
  passedCount: number;
  totalCount: number;
  conciseSummary: string;
}

export function auditCreativeBundle(
  htmlCode: string,
  cssCode: string,
  jsCode: string
): CreativeAuditReport {
  const checks: Array<{ ok: boolean; label: string }> = [
    {
      ok: /\bTHREE\./.test(jsCode) && /(WebGLRenderer|Scene)/.test(jsCode),
      label: 'Three.js WebGL scene',
    },
    {
      ok: /requestAnimationFrame/.test(jsCode) && jsCode.trim().length > 200,
      label: 'Real-time animation loop',
    },
    {
      ok: hasBalancedDelimiters(jsCode) && !/\bimport\s+.*from\s+['"]three/.test(jsCode),
      label: 'Valid runtime syntax',
    },
    {
      ok: htmlCode.trim().length > 40 && !/<\s*(?:!DOCTYPE|html|head|body)\b/i.test(htmlCode),
      label: 'HUD & stage markup',
    },
    {
      ok: cssCode.trim().length > 80 && !/<img\b[^>]*\bsrc\s*=\s*["']https?:\/\//i.test(htmlCode),
      label: 'Self-contained styling',
    },
  ];

  const failed = checks.filter((c) => !c.ok);
  const passedCount = checks.length - failed.length;
  const totalCount = checks.length;
  const conciseSummary =
    `Three.js QA (${passedCount}/${totalCount} checks passed)` +
    (failed.length > 0
      ? `: check ${failed.map((f) => f.label).join(', ')}`
      : ': WebGL scene, animation loop, runtime syntax, HUD, and self-contained assets verified.');

  return { passedCount, totalCount, conciseSummary };
}

async function requestCreativeAi(
  promptText: string,
  onStageUpdate: (stage: string) => void,
  attachments?: PromptAttachment[]
): Promise<string> {
  onStageUpdate('Connecting to Zuno Creative Studio...');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);

  try {
    onStageUpdate('Generating 3D Three.js scene & logic...');
    const res = await fetch('/api/craft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        mode: 'create_3d',
        promptText,
        systemPrompt: CREATIVE_STUDIO_SYSTEM_PROMPT,
        attachments: serializeAttachmentsForApi(attachments),
      }),
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = (await res.json()) as { text?: string };
      if (data.text) return data.text;
      throw new Error('Creative Studio received an empty AI response. Please tap Retry.');
    }

    const errBody = (await res.json().catch(() => null)) as { code?: string; error?: string } | null;
    if (res.status === 503 || errBody?.code === 'MISSING_SERVER_KEY') {
      throw new Error(
        errBody?.error ||
          'Zuno AI server keys are not configured yet. Site owners can add keys in Admin Control (/admin).'
      );
    }
    throw new Error(errBody?.error || `Creative Studio server error (HTTP ${res.status}).`);
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Creative Studio AI took too long to respond. Please tap Retry.');
    }
    throw err instanceof Error ? err : new Error('Failed to reach Creative Studio AI server.');
  }
}

export async function generateCreativeProject(
  prompt: string,
  category: CreativeCategory,
  blueprintHint: string | null = null,
  onStageUpdate: (stage: string) => void = () => {},
  attachments?: PromptAttachment[]
): Promise<GeneratedAppBundle> {
  const lines = [
    'BUILD THIS THREE.JS CREATIVE PROJECT:',
    `"${prompt}"`,
    '',
    `Creative Mode: ${getCreativeCategoryDisplayName(category)}`,
  ];

  if (blueprintHint) {
    lines.push('', `Visual / Gameplay Blueprint: ${blueprintHint}`);
  }

  lines.push(
    '',
    'Make the 3D visuals, lighting, camera movement, HUD, and controls genuinely fun and responsive on both Android touchscreens and desktop keyboards.',
    'Use global window.THREE (and THREE.OrbitControls if needed). No ES import statements.',
    'Output all sections using <<<TITLE>>>, <<<DESCRIPTION>>>, <<<SUMMARY>>>, <<<HTML>>>, <<<CSS>>>, <<<JS>>>, and <<<SUGGESTIONS>>>.'
  );

  const rawText = await requestCreativeAi(lines.join('\n'), onStageUpdate, attachments);
  const parsed = parseCraftAiResponse(rawText, null);
  onStageUpdate('Auditing Three.js scene...');
  const audit = auditCreativeBundle(parsed.htmlCode, parsed.cssCode, parsed.jsCode);

  return {
    ...parsed,
    changedFiles: ['index.html', 'styles.css', 'scene.js'],
    summary: parsed.summary ? `${parsed.summary}\n\n${audit.conciseSummary}` : audit.conciseSummary,
    qaSummary: audit.conciseSummary,
  };
}

export async function iterateCreativeProject(
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
    `EXISTING THREE.JS CREATIVE PROJECT: "${project.title}" (v${project.version})`,
    `Category: ${getCreativeCategoryDisplayName(project.creativeCategory)}`,
    `Original idea: ${project.initialPrompt}`,
  ];

  if (historyTail.length > 0) {
    lines.push('', 'Recent Creative Chat:');
    historyTail.forEach((m) => {
      lines.push(`- ${m.role === 'user' ? 'USER' : 'STUDIO_AI'}: ${m.content.slice(0, 240)}`);
    });
  }

  lines.push(
    '',
    'USER REQUEST NOW:',
    `"${userPrompt}"`,
    '',
    'Apply code modifications using global THREE cleanly and output updated <<<TITLE>>>, <<<DESCRIPTION>>>, <<<SUMMARY>>>, <<<HTML>>>, <<<CSS>>>, <<<JS>>>, <<<SUGGESTIONS>>>.',
    'If the user is only asking a question without requesting scene edits, answer inside <<<SUMMARY>>>.',
    '',
    'Current index.html:',
    activeHtml.slice(0, 10_000),
    '',
    'Current styles.css:',
    activeCss.slice(0, 8_000),
    '',
    'Current scene.js:',
    activeJs.slice(0, 16_000)
  );

  const fallback: GeneratedAppBundle = {
    projectTitle: project.title,
    description: project.description,
    summary: '',
    htmlCode: activeHtml,
    cssCode: activeCss,
    jsCode: activeJs,
    changedFiles: [],
    followUpSuggestions: [
      'Add dynamic weather & headlights',
      'Increase speed & add boost pads',
      'Switch camera angle to hood view',
    ],
  };

  const rawText = await requestCreativeAi(lines.join('\n'), onStageUpdate);
  const parsed = parseCraftAiResponse(rawText, fallback);

  const didChangeCode =
    parsed.htmlCode !== activeHtml || parsed.cssCode !== activeCss || parsed.jsCode !== activeJs;
  if (!didChangeCode) {
    return { ...parsed, changedFiles: [] };
  }

  onStageUpdate('Auditing updated Three.js scene...');
  const audit = auditCreativeBundle(parsed.htmlCode, parsed.cssCode, parsed.jsCode);
  return {
    ...parsed,
    changedFiles: parsed.changedFiles.map((f) => (f === 'app.js' ? 'scene.js' : f)),
    summary: parsed.summary ? `${parsed.summary}\n\n${audit.conciseSummary}` : audit.conciseSummary,
    qaSummary: audit.conciseSummary,
  };
}
