import { getActiveServerKeys, parseRequestJsonBody, type HttpReq, type HttpRes } from './_keyVault.js';
export interface CraftAttachmentPayload { name: string; mimeType: string; dataBase64?: string; textContent?: string; }
interface CraftRequestBody { mode?: 'build' | 'chat' | 'create_3d' | 'image'; promptText?: string; systemPrompt?: string; attachments?: CraftAttachmentPayload[]; }
const TEXT_MODEL = 'openai/gpt-oss-120b';
const VISION_MODEL = 'qwen/qwen3.8-27b';
function buildMessages(promptText: string, systemPrompt: string, attachments?: CraftAttachmentPayload[], vision = false) {
  const content: Array<Record<string, unknown>> = [{ type: 'text', text: promptText }];
  for (const att of (attachments ?? []).slice(0, 3)) {
    if (vision && att.dataBase64 && /^image\/(png|jpeg|jpg|webp)$/i.test(att.mimeType)) {
      content.push({ type: 'image_url', image_url: { url: `data:${att.mimeType === 'image/jpg' ? 'image/jpeg' : att.mimeType};base64,${att.dataBase64}` } });
    } else if (att.textContent) content.push({ type: 'text', text: `[Attached file: ${att.name}]\n${att.textContent.slice(0, 8000)}` });
  }
  const userContent = vision ? content : content.map((p) => p.type === 'text' ? String(p.text) : '').filter(Boolean).join('\n');
  return [...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []), { role: 'user', content: userContent }];
}
export default async function handler(req: HttpReq, res: HttpRes): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  const { keys } = await getActiveServerKeys();
  if (req.method === 'GET') { res.status(200).json({ ready: keys.length > 0, aiName: 'Zuno AI powered by Groq', capabilities: { chat: keys.length > 0, build: keys.length > 0, create3d: keys.length > 0, image: false, vision: keys.length > 0 } }); return; }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!keys.length) { res.status(503).json({ code: 'MISSING_SERVER_KEY', error: 'Groq API key is not configured. Add your Groq key in Owner Admin (/admin).' }); return; }
  const body = parseRequestJsonBody<CraftRequestBody>(req);
  if (!body) { res.status(400).json({ error: 'Invalid JSON request body.' }); return; }
  const mode = body.mode ?? 'build'; const promptText = body.promptText?.trim() ?? '';
  if (!promptText) { res.status(400).json({ error: 'Missing promptText.' }); return; }
  if (mode === 'image') { res.status(501).json({ code: 'IMAGE_PROVIDER_REQUIRED', error: 'Groq can understand images, but it cannot generate images. Connect a separate image-generation provider to enable this feature.' }); return; }
  const privatePrompt = mode === 'build' || mode === 'create_3d' ? (process.env.ZUNO_DESIGN_INTELLIGENCE_PROMPT ?? '').trim() : '';
  const systemPrompt = [body.systemPrompt?.trim() ?? '', privatePrompt].filter(Boolean).join('\n\n');
  const hasImages = (body.attachments ?? []).some((a) => a.dataBase64 && /^image\/(png|jpeg|jpg|webp)$/i.test(a.mimeType));
  let lastError = 'Groq did not return a response.';
  for (const apiKey of keys) {
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 55000);
    try {
      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ model: hasImages ? VISION_MODEL : TEXT_MODEL, messages: buildMessages(promptText, systemPrompt, body.attachments, hasImages), temperature: mode === 'chat' ? 0.65 : 0.35, max_tokens: 12000 }) });
      const payload = await upstream.json().catch(() => null) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } } | null;
      if (!upstream.ok) { lastError = payload?.error?.message || `Groq returned HTTP ${upstream.status}`; if (upstream.status === 401 || upstream.status === 403) break; continue; }
      const answer = payload?.choices?.[0]?.message?.content?.trim();
      if (answer) { res.status(200).json({ text: answer, model: hasImages ? VISION_MODEL : TEXT_MODEL, provider: 'groq' }); return; }
      lastError = 'Groq returned an empty response.';
    } catch (err) { lastError = err instanceof Error ? err.message : 'Groq request failed.'; }
    finally { clearTimeout(timeout); }
  }
  res.status(502).json({ error: lastError });
}