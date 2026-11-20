import {
  getActiveServerKeys,
  parseRequestJsonBody,
  type HttpReq,
  type HttpRes,
} from './_keyVault.js';

export interface CraftAttachmentPayload {
  name: string;
  mimeType: string;
  dataBase64?: string;
  textContent?: string;
}

interface CraftRequestBody {
  mode?: 'build' | 'chat' | 'create_3d' | 'image';
  promptText?: string;
  systemPrompt?: string;
  attachments?: CraftAttachmentPayload[];
}

const TEXT_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;
const IMAGE_MODELS = ['gemini-2.5-flash-image', 'gemini-2.0-flash-preview-image-generation'] as const;

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

function buildGeminiParts(
  promptText: string,
  attachments: CraftAttachmentPayload[] | undefined
): GeminiPart[] {
  const parts: GeminiPart[] = [];
  const textSections: string[] = [promptText];

  if (Array.isArray(attachments)) {
    for (const att of attachments.slice(0, 4)) {
      if (att.dataBase64 && /^image\/(png|jpeg|jpg|webp|gif)$/i.test(att.mimeType)) {
        parts.push({
          inlineData: {
            mimeType: att.mimeType === 'image/jpg' ? 'image/jpeg' : att.mimeType,
            data: att.dataBase64,
          },
        });
        textSections.push(`[Attached image: ${att.name}]`);
      } else if (att.textContent) {
        textSections.push(
          `\n[Attached file: ${att.name} (${att.mimeType || 'text/plain'})]\n${att.textContent.slice(0, 8000)}`
        );
      }
    }
  }

  parts.unshift({ text: textSections.join('\n') });
  return parts;
}

export default async function handler(req: HttpReq, res: HttpRes): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const { keys } = await getActiveServerKeys();
    res.status(200).json({
      ready: keys.length > 0,
      aiName: 'Zuno AI',
      capabilities: {
        chat: keys.length > 0,
        build: keys.length > 0,
        create3d: keys.length > 0,
        image: keys.length > 0,
      },
    });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { keys } = await getActiveServerKeys();
  if (keys.length === 0) {
    res.status(503).json({
      code: 'MISSING_SERVER_KEY',
      error:
        'Zuno AI server keys are not configured yet. Site owners can add Gemini keys in Admin Control (/admin) or Vercel Environment Variables.',
    });
    return;
  }

  const parsedBody = parseRequestJsonBody<CraftRequestBody>(req);
  if (!parsedBody) {
    res.status(400).json({ error: 'Invalid JSON request body.' });
    return;
  }

  const mode = parsedBody.mode ?? 'build';
  const promptText = parsedBody.promptText?.trim() ?? '';
  const systemPrompt = parsedBody.systemPrompt?.trim() ?? '';

  if (!promptText) {
    res.status(400).json({ error: 'Missing promptText.' });
    return;
  }

  const parts = buildGeminiParts(promptText, parsedBody.attachments);
  let lastError = 'Zuno AI failed to respond.';

  if (mode === 'image') {
    for (const apiKey of keys) {
      for (const model of IMAGE_MODELS) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 50_000);
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const upstream = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: 'user', parts }],
              generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
              },
            }),
          });

          const payload = (await upstream.json().catch(() => null)) as {
            candidates?: Array<{
              content?: {
                parts?: Array<{
                  text?: string;
                  inlineData?: { mimeType?: string; data?: string };
                }>;
              };
            }>;
            error?: { message?: string };
          } | null;

          if (!upstream.ok) {
            lastError = payload?.error?.message || `Zuno Image AI returned HTTP ${upstream.status}`;
            if (upstream.status === 401 || upstream.status === 403) break;
            continue;
          }

          const outParts = payload?.candidates?.[0]?.content?.parts ?? [];
          const imagePart = outParts.find((p) => p.inlineData?.data);
          const textPart = outParts.map((p) => p.text ?? '').join('').trim();

          if (imagePart?.inlineData?.data) {
            const mime = imagePart.inlineData.mimeType || 'image/png';
            res.status(200).json({
              imageDataUrl: `data:${mime};base64,${imagePart.inlineData.data}`,
              text: textPart || 'Generated image with Zuno AI.',
              model,
            });
            return;
          }

          lastError =
            textPart || 'Image generation returned no image data on the configured API key.';
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Image generation upstream error.';
        } finally {
          clearTimeout(timeout);
        }
      }
    }

    res.status(502).json({ error: lastError });
    return;
  }

  for (const apiKey of keys) {
    for (const model of TEXT_MODELS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 50_000);
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const upstream = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            ...(systemPrompt
              ? {
                  systemInstruction: {
                    parts: [{ text: systemPrompt }],
                  },
                }
              : {}),
            contents: [
              {
                role: 'user',
                parts,
              },
            ],
            generationConfig: {
              temperature: mode === 'chat' ? 0.65 : 0.45,
              maxOutputTokens: 16384,
            },
          }),
        });

        const payload = (await upstream.json().catch(() => null)) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          error?: { message?: string };
        } | null;

        if (!upstream.ok) {
          lastError = payload?.error?.message || `Zuno AI returned HTTP ${upstream.status}`;
          if (upstream.status === 401 || upstream.status === 403) {
            break;
          }
          continue;
        }

        const rawText =
          payload?.candidates?.[0]?.content?.parts
            ?.map((p) => p.text ?? '')
            .join('')
            .trim() ?? '';

        if (rawText) {
          res.status(200).json({ text: rawText, model });
          return;
        }
        lastError = 'Zuno AI returned an empty response.';
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Zuno AI upstream request failed.';
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  res.status(502).json({ error: lastError });
}
