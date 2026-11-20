import type { PromptAttachment } from '../types/project';

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB limit per file

function createAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsText(file);
  });
}

export async function readPromptAttachments(fileList: FileList | File[]): Promise<PromptAttachment[]> {
  const files = Array.from(fileList).slice(0, 4);
  const results: PromptAttachment[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      throw new Error(`"${file.name}" is larger than 4 MB. Please pick a smaller file.`);
    }

    const mime = file.type || 'text/plain';
    if (mime.startsWith('image/')) {
      const dataUrl = await readAsDataUrl(file);
      const commaIdx = dataUrl.indexOf(',');
      const base64 = commaIdx > 0 ? dataUrl.slice(commaIdx + 1) : '';
      results.push({
        id: createAttachmentId(),
        name: file.name,
        mimeType: mime,
        sizeBytes: file.size,
        dataBase64: base64,
        previewUrl: dataUrl,
      });
    } else if (
      mime.startsWith('text/') ||
      /\.(txt|md|json|csv|html|css|js|ts|tsx|xml|svg|yaml|yml)$/i.test(file.name)
    ) {
      const textContent = await readAsText(file);
      results.push({
        id: createAttachmentId(),
        name: file.name,
        mimeType: mime,
        sizeBytes: file.size,
        textContent: textContent.slice(0, 12_000),
      });
    } else {
      results.push({
        id: createAttachmentId(),
        name: file.name,
        mimeType: mime,
        sizeBytes: file.size,
        textContent: `[Binary file attached: ${file.name}, ${file.type || 'unknown type'}, ${file.size} bytes]`,
      });
    }
  }

  return results;
}

export function serializeAttachmentsForApi(attachments: PromptAttachment[] | undefined) {
  if (!attachments || attachments.length === 0) return undefined;
  return attachments.map((a) => ({
    name: a.name,
    mimeType: a.mimeType,
    ...(a.dataBase64 ? { dataBase64: a.dataBase64 } : {}),
    ...(a.textContent ? { textContent: a.textContent } : {}),
  }));
}
