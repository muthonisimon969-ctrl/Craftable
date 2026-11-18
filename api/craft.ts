import {
  getActiveServerKeys,
  parseRequestJsonBody,
  type HttpReq,
  type HttpRes,
} from './_keyVault.js';

interface CraftRequestBody {
  promptText?: string;
  systemPrompt?: string;
}

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;

export default async function handler(req: HttpReq, res: HttpRes): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const { keys } = await getActiveServerKeys();
    res.status(200).json({
      ready: keys.length > 0,
      aiName: 'Zuno AI',
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
        'Zuno AI is waiting for the site owner to connect Gemini API keys in Admin Control (/admin) or Vercel Environment Variables.',
    });
    return;
  }

  const parsedBody = parseRequestJsonBody<CraftRequestBody>(req);
  if (!parsedBody) {
    res.status(400).json({ error: 'Invalid JSON request body.' });
    return;
  }

  const promptText = parsedBody.promptText?.trim() ?? '';
  const systemPrompt = parsedBody.systemPrompt?.trim() ?? '';

  if (!promptText) {
    res.status(400).json({ error: 'Missing promptText.' });
    return;
  }

  let lastError = 'Zuno AI failed to respond.';

  for (const apiKey of keys) {
    for (const model of MODELS) {
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
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              temperature: 0.45,
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
