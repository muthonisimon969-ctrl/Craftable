import { get, list, put } from '@vercel/blob';
import {
  isAdminRequestAuthenticated,
  type HttpReq,
  type HttpRes,
} from './_keyVault.js';

type LibraryRequest = HttpReq & { url?: string; headers?: Record<string, string | string[] | undefined> };
type LibraryResponse = HttpRes & { end: (chunk?: unknown) => void };

const PREFIX = 'zuno-library/';
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export const config = { api: { bodyParser: false } };

export default async function handler(req: LibraryRequest, res: LibraryResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (!isAdminRequestAuthenticated(req)) {
    res.status(401).json({ error: 'Owner admin session required.' });
    return;
  }

  const url = new URL(req.url ?? '/api/library', 'https://zuno.local');
  const action = url.searchParams.get('action') ?? '';

  try {
    if (req.method === 'GET' && action === 'list') {
      const result = await list({ prefix: PREFIX, limit: 200 });
      res.status(200).json({
        assets: result.blobs.map((blob) => ({
          pathname: blob.pathname,
          uploadedAt: blob.uploadedAt,
        })),
        cursor: result.cursor ?? null,
      });
      return;
    }

    if (req.method === 'POST') {
      const contentTypeHeader = req.headers?.['content-type'];
      const contentType = Array.isArray(contentTypeHeader) ? contentTypeHeader[0] : contentTypeHeader;
      const mime = (contentType ?? '').split(';')[0].trim().toLowerCase();
      if (!ALLOWED_TYPES.has(mime)) {
        res.status(415).json({ error: 'Use a JPEG, PNG, WebP, or AVIF image.' });
        return;
      }

      const lengthHeader = req.headers?.['content-length'];
      const length = Number(Array.isArray(lengthHeader) ? lengthHeader[0] : lengthHeader);
      if (Number.isFinite(length) && length > MAX_IMAGE_BYTES) {
        res.status(413).json({ error: 'Each image must be 4 MB or smaller.' });
        return;
      }

      const rawName = url.searchParams.get('filename') ?? 'image';
      const filename = rawName.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-100);
      if (!filename || !/\.(jpe?g|png|webp|avif)$/i.test(filename)) {
        res.status(400).json({ error: 'A valid image filename is required.' });
        return;
      }

      const blob = await put(PREFIX + filename, req as never, {
        access: 'private',
        addRandomSuffix: true,
        contentType: mime,
      });
      res.status(201).json({
        uploaded: true,
        pathname: blob.pathname,
        contentType: blob.contentType,
        size: Number(Array.isArray(req.headers?.['content-length']) ? req.headers?.['content-length'][0] : req.headers?.['content-length']) || 0,
        uploadedAt: new Date().toISOString(),
      });
      return;
    }

    if (req.method === 'GET' && action === 'image') {
      const pathname = url.searchParams.get('pathname') ?? '';
      if (!pathname.startsWith(PREFIX) || pathname.includes('..')) {
        res.status(400).json({ error: 'Invalid library image path.' });
        return;
      }
      const result = await get(pathname, { access: 'private' });
      if (!result || !result.stream) {
        res.status(404).json({ error: 'Image not found.' });
        return;
      }
      const chunks: Uint8Array[] = [];
      const reader = result.stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const image = Buffer.concat(chunks);
      res.setHeader('Content-Type', result.blob.contentType ?? 'application/octet-stream');
      res.setHeader('Content-Length', String(image.byteLength));
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.status(200);
      res.end(image);
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Use GET action=list/image or POST to upload an image.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Private library operation failed.';
    res.status(500).json({ error: message });
  }
}
