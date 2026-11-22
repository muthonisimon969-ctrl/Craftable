import { put } from '@vercel/blob';
import {
  isAdminRequestAuthenticated,
  type HttpReq,
  type HttpRes,
} from './_keyVault.js';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

interface UploadBody {
  name?: string;
  mimeType?: string;
  dataBase64?: string;
}

function safeFileName(value: string, extension: string): string {
  const base = value
    .replace(/\\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'asset';
  return `${base}.${extension}`;
}

export default async function handler(req: HttpReq, res: HttpRes): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAdminRequestAuthenticated(req)) {
    res.status(401).json({ error: 'Admin sign-in required.' });
    return;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    res.status(503).json({ error: 'Private Blob storage is not connected to this deployment.' });
    return;
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as UploadBody;
  const mimeType = (body.mimeType ?? '').toLowerCase();
  const extension = ALLOWED_TYPES[mimeType];
  const encoded = body.dataBase64?.replace(/^data:[^,]+;base64,/i, '').replace(/\\s/g, '');

  if (!extension || !encoded || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
    res.status(400).json({ error: 'Provide a PNG, JPEG, or WebP image as base64.' });
    return;
  }

  const estimatedBytes = Math.floor((encoded.length * 3) / 4) - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0);
  if (estimatedBytes <= 0 || estimatedBytes > MAX_IMAGE_BYTES) {
    res.status(413).json({ error: 'Each image must be 3 MB or smaller.' });
    return;
  }

  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length !== estimatedBytes || bytes.length > MAX_IMAGE_BYTES) {
    res.status(400).json({ error: 'The image data is invalid.' });
    return;
  }

  const filename = safeFileName(body.name || 'asset', extension);
  const pathname = `design-library/${filename}`;

  try {
    const blob = await put(pathname, bytes, {
      access: 'private',
      addRandomSuffix: true,
      contentType: mimeType,
      token,
    });

    res.status(201).json({
      uploaded: true,
      access: 'private',
      pathname: blob.pathname,
      contentType: mimeType,
      size: bytes.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Private image upload failed.';
    res.status(502).json({ error: message });
  }
}
