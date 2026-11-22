import { del, list } from '@vercel/blob';
import {
  isAdminRequestAuthenticated,
  type HttpReq,
  type HttpRes,
} from './_keyVault.js';

type CleanupRequest = HttpReq & { url?: string };
const OLD_LIBRARY_PREFIX = 'zuno-design-library/';
const CONFIRM_PHRASE = 'DELETE OLD DESIGN LIBRARY';
const PAGE_SIZE = 1000;

interface OldBlob {
  pathname: string;
  size: number;
}

async function collectOldLibraryBlobs(): Promise<OldBlob[]> {
  const all: OldBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({
      prefix: OLD_LIBRARY_PREFIX,
      limit: PAGE_SIZE,
      ...(cursor ? { cursor } : {}),
    });
    for (const blob of page.blobs) {
      // Defense in depth: never accept a path outside the exact legacy prefix.
      if (blob.pathname.startsWith(OLD_LIBRARY_PREFIX)) {
        all.push({ pathname: blob.pathname, size: blob.size });
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return all;
}

export default async function handler(req: CleanupRequest, res: HttpRes): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAdminRequestAuthenticated(req)) {
    res.status(401).json({ error: 'Owner admin session required.' });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Use GET to preview or POST to confirm cleanup.' });
    return;
  }

  try {
    const blobs = await collectOldLibraryBlobs();
    const totalBytes = blobs.reduce((sum, blob) => sum + blob.size, 0);

    if (req.method === 'GET') {
      res.status(200).json({
        prefix: OLD_LIBRARY_PREFIX,
        count: blobs.length,
        totalBytes,
        confirmPhrase: CONFIRM_PHRASE,
      });
      return;
    }

    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : (req.body && typeof req.body === 'object' ? req.body as { confirmPhrase?: string } : {});
    if (body?.confirmPhrase !== CONFIRM_PHRASE) {
      res.status(400).json({ error: 'Confirmation phrase did not match. Nothing was deleted.' });
      return;
    }
    if (blobs.length === 0) {
      res.status(200).json({ deleted: 0, totalBytes: 0, message: 'The old design library is already empty.' });
      return;
    }

    let deleted = 0;
    for (let i = 0; i < blobs.length; i += 100) {
      const batch = blobs.slice(i, i + 100);
      // Pass only pathnames verified against the exact legacy prefix above.
      await del(batch.map((blob) => blob.pathname));
      deleted += batch.length;
    }

    const remaining = await collectOldLibraryBlobs();
    res.status(200).json({
      deleted,
      remaining: remaining.length,
      totalBytes,
      message: remaining.length === 0
        ? 'Old design-library image files deleted.'
        : 'Deletion ran, but some old image files remain. Run preview again before retrying.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Legacy library cleanup failed.';
    res.status(500).json({ error: message });
  }
}
