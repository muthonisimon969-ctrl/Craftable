import {
  buildAdminCookieHeader,
  createAdminSessionToken,
  getActiveServerKeys,
  getAdminPassword,
  isAdminRequestAuthenticated,
  parseKeyList,
  parseRequestJsonBody,
  safeCompare,
  saveServerKeys,
  type HttpReq,
  type HttpRes,
} from './_keyVault.js';

interface AdminPostBody {
  action?: 'login' | 'logout' | 'save_keys' | 'test_keys';
  password?: string;
  keysText?: string;
}

export default async function handler(req: HttpReq, res: HttpRes): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  const configuredPassword = getAdminPassword();

  if (req.method === 'GET') {
    const authenticated = isAdminRequestAuthenticated(req);
    if (!authenticated) {
      res.status(200).json({
        authenticated: false,
        hasAdminPassword: Boolean(configuredPassword),
      });
      return;
    }

    const { keys, persistenceMode } = await getActiveServerKeys();
    res.status(200).json({
      authenticated: true,
      hasAdminPassword: Boolean(configuredPassword),
      keyCount: keys.length,
      ready: keys.length > 0,
      persistenceMode,
    });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = parseRequestJsonBody<AdminPostBody>(req);
  if (!body) {
    res.status(400).json({ error: 'Invalid JSON request body.' });
    return;
  }

  if (body.action === 'logout') {
    res.setHeader('Set-Cookie', buildAdminCookieHeader(req, '', true));
    res.status(200).json({ authenticated: false });
    return;
  }

  if (!configuredPassword) {
    res.status(503).json({
      code: 'ADMIN_PASSWORD_UNSET',
      error:
        'Set ZUNO_ADMIN_PASSWORD in your Vercel Environment Variables before logging into Admin Control.',
    });
    return;
  }

  if (body.action === 'login') {
    const attempt = (body.password ?? '').trim();
    if (!attempt || !safeCompare(attempt, configuredPassword)) {
      res.status(401).json({ error: 'Incorrect admin password.' });
      return;
    }
    const token = createAdminSessionToken();
    res.setHeader('Set-Cookie', buildAdminCookieHeader(req, token, false));
    const { keys, persistenceMode } = await getActiveServerKeys();
    res.status(200).json({
      authenticated: true,
      hasAdminPassword: true,
      keyCount: keys.length,
      ready: keys.length > 0,
      persistenceMode,
    });
    return;
  }

  if (!isAdminRequestAuthenticated(req)) {
    res.status(401).json({ error: 'Admin session required. Please sign in.' });
    return;
  }

  if (body.action === 'save_keys') {
    const parsedKeys = parseKeyList(body.keysText ?? '');
    if (parsedKeys.length === 0 && (body.keysText ?? '').trim().length > 0) {
      res.status(400).json({
        error: 'No valid API keys detected. Paste one Groq API key per line.',
      });
      return;
    }

    const result = await saveServerKeys(parsedKeys);
    res.status(200).json({
      ok: true,
      keyCount: result.savedCount,
      ready: result.savedCount > 0,
      persistenceMode: result.persistenceMode,
      message:
        result.savedCount === 0
          ? 'Cleared runtime API keys.'
          : result.persistenceMode === 'vercel_env' || result.persistenceMode === 'kv_encrypted'
          ? `Securely stored ${result.savedCount} key(s) on the server.`
          : `Saved ${result.savedCount} key(s) in active server memory. Add GROQ_API_KEY (or VERCEL_TOKEN + VERCEL_PROJECT_ID / Vercel KV) in Vercel for persistence across cold restarts.`,
    });
    return;
  }

  if (body.action === 'test_keys') {
    const { keys } = await getActiveServerKeys();
    if (keys.length === 0) {
      res.status(400).json({ error: 'No server API keys are currently saved.' });
      return;
    }

    let workingCount = 0;
    let lastError = 'Key verification failed.';

    for (const key of keys) {
      try {
        const probe = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: 'Reply with OK' }],
              model: 'llama-3.3-70b-versatile', max_tokens: 8,
            }),
          }
        );
        if (probe.ok) {
          workingCount++;
        } else {
          const payload = (await probe.json().catch(() => null)) as { error?: { message?: string } } | null;
          lastError = payload?.error?.message || `HTTP ${probe.status}`;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Network error testing key.';
      }
    }

    if (workingCount === 0) {
      res.status(502).json({ ok: false, workingCount: 0, totalKeys: keys.length, error: lastError });
      return;
    }

    res.status(200).json({
      ok: true,
      workingCount,
      totalKeys: keys.length,
      message: `${workingCount} of ${keys.length} key(s) verified live with Groq.`,
    });
    return;
  }

  res.status(400).json({ error: 'Unsupported admin action.' });
}
