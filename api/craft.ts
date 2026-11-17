interface CraftRequestBody {
  promptText?: string;
  systemPrompt?: string;
}

interface VercelRequest {
  method?: string;
  body?: CraftRequestBody | string;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({
      code: 'MISSING_SERVER_KEY',
      error: 'GEMINI_API_KEY is not set in Vercel Environment Variables. Configure it in Vercel or add a personal Gemini API key in Craft AI Settings.',
    });
    return;
  }

  let parsedBody: CraftRequestBody = {};
  if (typeof req.body === 'string') {
    try {
      parsedBody = JSON.parse(req.body) as CraftRequestBody;
    } catch {
      res.status(400).json({ error: 'Invalid JSON request body.' });
      return;
    }
  } else if (req.body && typeof req.body === 'object') {
    parsedBody = req.body;
  }

  const promptText = parsedBody.promptText?.trim() ?? '';
  const systemPrompt = parsedBody.systemPrompt?.trim() ?? '';

  if (!promptText) {
    res.status(400).json({ error: 'Missing promptText.' });
    return;
  }

  let lastError = 'Craft AI failed to respond.';

  for (const model of MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
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
          },
        }),
      });

      const payload = (await upstream.json().catch(() => null)) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      } | null;

      if (!upstream.ok) {
        lastError = payload?.error?.message || `Craft AI returned HTTP ${upstream.status}`;
        if (upstream.status === 401 || upstream.status === 403) {
          res.status(upstream.status).json({ error: lastError });
          return;
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
      lastError = 'Craft AI returned an empty response.';
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Craft AI upstream request failed.';
    } finally {
      clearTimeout(timeout);
    }
  }

  res.status(502).json({ error: lastError });
}
