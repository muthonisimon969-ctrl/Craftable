import { getActiveServerKeys, parseRequestJsonBody, type HttpReq, type HttpRes } from './_keyVault.js';

interface VisualReviewBody {
  projectTitle?: string;
  originalBrief?: string;
  screenshot?: string;
  viewport?: string;
  screenshots?: Array<{ screenshot: string; viewport: string }>;
  consoleErrors?: string[];
}

interface VisualFinding {
  severity: 'blocker' | 'high' | 'medium' | 'low';
  area: string;
  problem: string;
  recommendation: string;
}

interface VisualReview {
  score: number;
  verdict: 'ready' | 'needs_polish' | 'needs_repair';
  summary: string;
  strengths: string[];
  findings: VisualFinding[];
  responsiveConcerns: string[];
}

const VISION_MODEL = (process.env.ZUNO_VISION_MODEL || process.env.OPENROUTER_VISION_MODEL || 'qwen/qwen3.8-27b').trim();

function parseReview(raw: string): VisualReview | null {
  const cleaned = raw.trim().replace(/^\`\`\`(?:json)?\s*/i, '').replace(/\s*\`\`\`$/, '');
  try {
    const value = JSON.parse(cleaned) as Partial<VisualReview>;
    if (
      typeof value.score !== 'number' ||
      !['ready', 'needs_polish', 'needs_repair'].includes(String(value.verdict)) ||
      typeof value.summary !== 'string' ||
      !Array.isArray(value.findings)
    ) return null;
    return {
      score: Math.max(0, Math.min(100, Math.round(value.score))),
      verdict: value.verdict as VisualReview['verdict'],
      summary: value.summary.slice(0, 1200),
      strengths: Array.isArray(value.strengths) ? value.strengths.filter((x): x is string => typeof x === 'string').slice(0, 6) : [],
      findings: value.findings.slice(0, 12).flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const finding = item as Partial<VisualFinding>;
        if (typeof finding.problem !== 'string' || typeof finding.recommendation !== 'string') return [];
        const severity = ['blocker', 'high', 'medium', 'low'].includes(String(finding.severity))
          ? finding.severity as VisualFinding['severity'] : 'medium';
        return [{
          severity,
          area: String(finding.area || 'visual design').slice(0, 80),
          problem: finding.problem.slice(0, 300),
          recommendation: finding.recommendation.slice(0, 300),
        }];
      }),
      responsiveConcerns: Array.isArray(value.responsiveConcerns)
        ? value.responsiveConcerns.filter((x): x is string => typeof x === 'string').slice(0, 6)
        : [],
    };
  } catch {
    return null;
  }
}

async function inspectWithProvider(
  provider: 'groq' | 'openrouter',
  apiKey: string,
  body: VisualReviewBody,
  screenshots: Array<{ screenshot: string; viewport: string }>
): Promise<VisualReview | null> {
  const endpoint = provider === 'groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions';
  const model = provider === 'groq'
    ? VISION_MODEL
    : (process.env.OPENROUTER_VISION_MODEL || VISION_MODEL).trim();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const headers: Record<string, string> = {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    };
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://zuno-muthonisimon969-ctrl.vercel.app';
      headers['X-Title'] = 'Zuno Visual Intelligence';
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 1800,
        messages: [
          {
            role: 'system',
            content: 'You are Zuno Visual QA, a rigorous senior art director and responsive web design reviewer. Inspect the supplied screenshot as the rendered truth. Do not infer that a feature works merely because it looks clickable. Judge visual hierarchy, spacing, typography, contrast, composition, image quality/crop/relevance, density, alignment, polish, and visible clipping. Compare the result to the stated brief. Be fair: do not demand a particular aesthetic or redesign a deliberate brand direction. A page is not ready merely because it is technically valid. Return ONLY valid JSON with this shape: {"score":0,"verdict":"ready|needs_polish|needs_repair","summary":"...","strengths":["..."],"findings":[{"severity":"blocker|high|medium|low","area":"...","problem":"...","recommendation":"..."}],"responsiveConcerns":["..."]}. Score 85+ only when the screenshot is genuinely polished and coherent. Use needs_repair for serious visible defects; needs_polish for smaller refinements. Never invent defects not visible in the screenshot.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Review this rendered Zuno project. Project: ' + String(body.projectTitle || 'Untitled').slice(0, 120) +
                  '\nOriginal brief: ' + String(body.originalBrief || '').slice(0, 2500) +
                  '\nViewport: ' + String(body.viewport || 'workspace preview') +
                  '\nConsole errors observed: ' + (body.consoleErrors ?? []).slice(0, 8).join(' | ') +
                  '\nAssess only what is visible. Return the requested JSON.'
              },
              ...screenshots.map((item) => ({ type: 'image_url', image_url: { url: item.screenshot } })),
            ],
          },
        ],
      }),
    });
    const payload = await response.json().catch(() => null) as {
      choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
    } | null;
    if (!response.ok) return null;
    const raw = payload?.choices?.[0]?.message?.content;
    const text = typeof raw === 'string'
      ? raw
      : Array.isArray(raw) ? raw.map((part) => part.text || '').join('') : '';
    return text ? parseReview(text) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req: HttpReq, res: HttpRes): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const body = parseRequestJsonBody<VisualReviewBody>(req);
  if (!body || typeof body.screenshot !== 'string') {
    res.status(400).json({ error: 'A rendered screenshot is required.' });
    return;
  }
  if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(body.screenshot)) {
    res.status(400).json({ error: 'Screenshot must be a valid PNG, JPEG, or WebP data URL.' });
    return;
  }
  if (body.screenshot.length > 5_000_000) {
    res.status(413).json({ error: 'Screenshot is too large. Capture a smaller preview and try again.' });
    return;
  }

  const { keys } = await getActiveServerKeys();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim() || '';
  if (keys.length === 0 && openRouterKey.length < 16) {
    res.status(503).json({ error: 'Visual inspection is unavailable because no vision provider is configured.' });
    return;
  }

  for (const key of keys) {
    const result = await inspectWithProvider('groq', key, body, screenshots);
    if (result) {
      res.status(200).json({ review: result, provider: 'groq' });
      return;
    }
  }
  if (openRouterKey.length >= 16) {
    const result = await inspectWithProvider('openrouter', openRouterKey, body, screenshots);
    if (result) {
      res.status(200).json({ review: result, provider: 'openrouter' });
      return;
    }
  }

  res.status(502).json({ error: 'Zuno could not inspect this screenshot. Check that the configured vision model supports image input.' });
}
