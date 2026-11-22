import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface HttpReq {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

export interface HttpRes {
  status: (code: number) => HttpRes;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
}

export type PersistenceMode =
  | 'vercel_env'
  | 'kv_encrypted'
  | 'env_var'
  | 'local_file'
  | 'session_memory'
  | 'unconfigured';

const COOKIE_NAME = 'zuno_admin_session';
const KV_STORAGE_KEY = 'zuno_ai:groq_keys_enc_v1';
const LOCAL_VAULT_FILE = path.resolve(process.cwd(), '.zuno-keys.local.json');

let runtimeKeys: string[] | null = null;

export function parseKeyList(raw: string | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const list: string[] = [];
  for (const part of raw.split(/[\n,;]+/)) {
    const cleaned = part.trim();
    if (cleaned.length >= 16 && !seen.has(cleaned)) {
      seen.add(cleaned);
      list.push(cleaned);
    }
  }
  return list;
}

function getEnvKeys(): string[] {
  return parseKeyList(
    [process.env.GROQ_API_KEYS ?? '', process.env.GROQ_API_KEY ?? ''].filter(Boolean).join('\n')
  );
}

export function getAdminPassword(): string {
  return (process.env.ZUNO_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? '').trim();
}

function getSigningSecret(): string {
  const adminPw = getAdminPassword();
  const explicit = (process.env.ZUNO_SESSION_SECRET ?? process.env.GROQ_VAULT_SECRET ?? '').trim();
  return explicit || `zuno-session-key::${adminPw}`;
}

function deriveAesKey(): Buffer {
  return crypto.createHash('sha256').update(getSigningSecret()).digest();
}

function encryptText(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveAesKey(), iv);
  const enc = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${enc.toString('base64')}`;
}

function decryptText(payload: string): string | null {
  try {
    const [ivB64, tagB64, encB64] = payload.split('.');
    if (!ivB64 || !tagB64 || !encB64) return null;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      deriveAesKey(),
      Buffer.from(ivB64, 'base64')
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(encB64, 'base64')),
      decipher.final(),
    ]);
    return dec.toString('utf8');
  } catch {
    return null;
  }
}

function hasKvConfig(): boolean {
  return Boolean(process.env.KV_REST_API_URL?.trim() && process.env.KV_REST_API_TOKEN?.trim());
}

function hasVercelSyncConfig(): boolean {
  return Boolean(process.env.VERCEL_TOKEN?.trim() && process.env.VERCEL_PROJECT_ID?.trim());
}

async function readKvKeys(): Promise<string[] | null> {
  if (!hasKvConfig()) return null;
  try {
    const url = `${process.env.KV_REST_API_URL!.replace(/\/+$/, '')}/get/${encodeURIComponent(KV_STORAGE_KEY)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN!.trim()}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string | null };
    if (!data?.result) return null;
    const dec = decryptText(data.result);
    if (!dec) return null;
    const parsed = JSON.parse(dec) as { keys?: unknown };
    if (!Array.isArray(parsed.keys)) return null;
    return parseKeyList(parsed.keys.filter((x): x is string => typeof x === 'string').join('\n'));
  } catch {
    return null;
  }
}

async function writeKvKeys(keys: string[]): Promise<boolean> {
  if (!hasKvConfig()) return false;
  try {
    const encrypted = encryptText(JSON.stringify({ keys }));
    const base = process.env.KV_REST_API_URL!.replace(/\/+$/, '');
    const res = await fetch(`${base}/set/${encodeURIComponent(KV_STORAGE_KEY)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN!.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encrypted),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function syncVercelEnvKeys(keys: string[]): Promise<boolean> {
  if (!hasVercelSyncConfig()) return false;
  try {
    const token = process.env.VERCEL_TOKEN!.trim();
    const projectId = process.env.VERCEL_PROJECT_ID!.trim();
    const teamId = process.env.VERCEL_TEAM_ID?.trim();
    const teamQuery = teamId ? `&teamId=${encodeURIComponent(teamId)}` : '';
    const joined = keys.join(',');
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env?upsert=true${teamQuery}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'GROQ_API_KEYS',
          value: joined,
          type: 'encrypted',
          target: ['production', 'preview', 'development'],
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

function readLocalDevKeys(): string[] {
  if (process.env.VERCEL) return [];
  try {
    if (!fs.existsSync(LOCAL_VAULT_FILE)) return [];
    const raw = fs.readFileSync(LOCAL_VAULT_FILE, 'utf8');
    const parsed = JSON.parse(raw) as { keys?: unknown };
    if (!Array.isArray(parsed.keys)) return [];
    return parseKeyList(parsed.keys.filter((x): x is string => typeof x === 'string').join('\n'));
  } catch {
    return [];
  }
}

function writeLocalDevKeys(keys: string[]): boolean {
  if (process.env.VERCEL) return false;
  try {
    if (keys.length === 0) {
      if (fs.existsSync(LOCAL_VAULT_FILE)) fs.unlinkSync(LOCAL_VAULT_FILE);
    } else {
      fs.writeFileSync(LOCAL_VAULT_FILE, JSON.stringify({ keys }, null, 2), { mode: 0o600 });
    }
    return true;
  } catch {
    return false;
  }
}

export async function getActiveServerKeys(): Promise<{
  keys: string[];
  persistenceMode: PersistenceMode;
}> {
  if (runtimeKeys && runtimeKeys.length > 0) {
    const mode: PersistenceMode = hasVercelSyncConfig()
      ? 'vercel_env'
      : hasKvConfig()
      ? 'kv_encrypted'
      : !process.env.VERCEL
      ? 'local_file'
      : 'session_memory';
    return { keys: runtimeKeys, persistenceMode: mode };
  }

  const kvKeys = await readKvKeys();
  if (kvKeys && kvKeys.length > 0) {
    runtimeKeys = kvKeys;
    return { keys: kvKeys, persistenceMode: 'kv_encrypted' };
  }

  if (!process.env.VERCEL) {
    const localKeys = readLocalDevKeys();
    if (localKeys.length > 0) {
      runtimeKeys = localKeys;
      return { keys: localKeys, persistenceMode: 'local_file' };
    }
  }

  const envKeys = getEnvKeys();
  if (envKeys.length > 0) {
    return { keys: envKeys, persistenceMode: 'env_var' };
  }

  return { keys: [], persistenceMode: 'unconfigured' };
}

export async function saveServerKeys(keys: string[]): Promise<{
  savedCount: number;
  persistenceMode: PersistenceMode;
}> {
  runtimeKeys = [...keys];
  if (keys.length > 0) {
    process.env.GROQ_API_KEYS = keys.join(',');
  } else {
    delete process.env.GROQ_API_KEYS;
  }

  if (await syncVercelEnvKeys(keys)) {
    return { savedCount: keys.length, persistenceMode: 'vercel_env' };
  }
  if (await writeKvKeys(keys)) {
    return { savedCount: keys.length, persistenceMode: 'kv_encrypted' };
  }
  if (writeLocalDevKeys(keys)) {
    return { savedCount: keys.length, persistenceMode: 'local_file' };
  }
  return {
    savedCount: keys.length,
    persistenceMode: keys.length > 0 ? 'session_memory' : 'unconfigured',
  };
}

export function safeCompare(a: string, b: string): boolean {
  const bufA = crypto.createHash('sha256').update(a).digest();
  const bufB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createAdminSessionToken(): string {
  const exp = Date.now() + 8 * 60 * 60 * 1000;
  const payload = String(exp);
  const sig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token || !getAdminPassword()) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expectedSig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
  return safeCompare(sig, expectedSig);
}

export function parseCookieHeader(req: HttpReq, name: string): string | undefined {
  const rawCookie = req.headers?.cookie;
  const header = Array.isArray(rawCookie) ? rawCookie.join('; ') : rawCookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k === name) return decodeURIComponent(v);
  }
  return undefined;
}

export function isAdminRequestAuthenticated(req: HttpReq): boolean {
  const token = parseCookieHeader(req, COOKIE_NAME);
  return verifyAdminSessionToken(token);
}

export function buildAdminCookieHeader(req: HttpReq, value: string, clear = false): string {
  const proto = req.headers?.['x-forwarded-proto'];
  const isHttps = proto === 'https' || (Array.isArray(proto) && proto.includes('https'));
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/api',
    'HttpOnly',
    'SameSite=Strict',
    clear ? 'Max-Age=0' : 'Max-Age=28800',
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

export function parseRequestJsonBody<T>(req: HttpReq): T | null {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as T;
    } catch {
      return null;
    }
  }
  if (req.body && typeof req.body === 'object') {
    return req.body as T;
  }
  return {} as T;
}
