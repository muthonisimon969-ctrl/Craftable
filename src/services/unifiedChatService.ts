import type {
  ChatThreadMessage,
  GeneratedVisualAsset,
  PromptAttachment,
} from '../types/project';
import { serializeAttachmentsForApi } from '../utils/attachmentReader';

const CHAT_STORAGE_KEY = 'zuno_unified_chat_v1';
const IMAGES_STORAGE_KEY = 'zuno_created_images_v1';

const CHAT_SYSTEM_PROMPT = `You are Zuno AI — an intelligent, concise creative & technical partner (Philosophy: Chat. Think. Create. Build.).
Help users brainstorm product ideas, reason through architecture, analyze uploaded images/files, write copy or code, and refine concepts.
Be direct, insightful, and practical. If the user asks a broad idea that would look great as an interactive website, web app, or 3D experience, end with a short line starting with "BUILD_IDEA: " suggesting a concrete 1-sentence build prompt they can launch with one click.`;

export function loadChatHistory(): ChatThreadMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatThreadMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatThreadMessage[]): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadCreatedImages(): GeneratedVisualAsset[] {
  try {
    const raw = localStorage.getItem(IMAGES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GeneratedVisualAsset[]) : [];
  } catch {
    return [];
  }
}

export function saveCreatedImages(assets: GeneratedVisualAsset[]): void {
  try {
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(assets.slice(0, 16)));
  } catch {
    // Ignore storage quota errors
  }
}

export async function sendUnifiedChatTurn(
  userMessage: string,
  history: ChatThreadMessage[],
  attachments?: PromptAttachment[]
): Promise<{ replyText: string; suggestedBuildPrompt?: string }> {
  const recent = history.slice(-8);
  const contextLines: string[] = [];
  if (recent.length > 0) {
    contextLines.push('Conversation so far:');
    recent.forEach((m) => {
      contextLines.push(`${m.role === 'user' ? 'User' : 'Zuno AI'}: ${m.content.slice(0, 800)}`);
    });
    contextLines.push('');
  }
  contextLines.push(`User now: ${userMessage}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50_000);
  try {
    const res = await fetch('/api/craft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        mode: 'chat',
        promptText: contextLines.join('\n'),
        systemPrompt: CHAT_SYSTEM_PROMPT,
        attachments: serializeAttachmentsForApi(attachments),
      }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errBody = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(errBody?.error || `Zuno AI server error (HTTP ${res.status}).`);
    }

    const data = (await res.json()) as { text?: string };
    const raw = (data.text ?? '').trim();
    if (!raw) {
      throw new Error('Zuno AI returned an empty response. Please try again.');
    }

    const buildLineMatch = /^BUILD_IDEA:\s*(.+)$/im.exec(raw);
    const suggestedBuildPrompt = buildLineMatch?.[1]?.trim();
    const replyText = buildLineMatch
      ? raw.replace(/^BUILD_IDEA:\s*.+$/im, '').trim()
      : raw;

    return { replyText, suggestedBuildPrompt };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Zuno AI took too long to reply. Please retry.');
    }
    throw err instanceof Error ? err : new Error('Failed to reach Zuno AI chat service.');
  }
}

export async function generateAiVisual(
  prompt: string,
  attachments?: PromptAttachment[]
): Promise<GeneratedVisualAsset> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 52_000);
  try {
    const res = await fetch('/api/craft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        mode: 'image',
        promptText: prompt,
        attachments: serializeAttachmentsForApi(attachments),
      }),
    });
    clearTimeout(timer);

    const data = (await res.json().catch(() => null)) as {
      code?: string;
      imageDataUrl?: string;
      text?: string;
      model?: string;
      error?: string;
    } | null;

    if (data?.code === 'IMAGE_PROVIDER_REQUIRED') {
      throw new Error('Zuno image generation is not connected yet. A dedicated image-generation provider must be configured before this feature can create images.');
    }
    if (!res.ok || !data?.imageDataUrl) {
      throw new Error(data?.error || `Image generation did not succeed (HTTP ${res.status}).`);
    }

    return {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      prompt,
      imageDataUrl: data.imageDataUrl,
      caption: data.text || 'Generated with Zuno AI',
      model: data.model || 'groq-image',
      createdAtMillis: Date.now(),
    };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Image creation timed out. Please retry.');
    }
    throw err instanceof Error ? err : new Error('Failed to create AI image.');
  }
}
