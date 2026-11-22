import { useRef, useState } from 'react';
import {
  ArrowUp,
  Box,
  Hammer,
  Image as ImageIcon,
  MessageSquare,
  Paperclip,
  X,
} from 'lucide-react';
import type { PromptAttachment, StudioCapability } from '../types/project';
import { readPromptAttachments } from '../utils/attachmentReader';

interface PromptComposerProps {
  promptText: string;
  capability: StudioCapability;
  attachments: PromptAttachment[];
  isBusy: boolean;
  busyLabel?: string;
  placeholder?: string;
  onPromptChange: (text: string) => void;
  onCapabilityChange: (cap: StudioCapability) => void;
  onAttachmentsChange: (attachments: PromptAttachment[]) => void;
  onSubmit: () => void;
}

const CAPABILITY_OPTIONS: Array<{
  id: StudioCapability;
  label: string;
  icon: typeof Hammer;
}> = [
  { id: 'build', label: 'Build App', icon: Hammer },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'create_3d', label: '3D Scene', icon: Box },
  { id: 'image', label: 'Create Image', icon: ImageIcon },
];

export function PromptComposer({
  promptText,
  capability,
  attachments,
  isBusy,
  busyLabel,
  placeholder,
  onPromptChange,
  onCapabilityChange,
  onAttachmentsChange,
  onSubmit,
}: PromptComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachError, setAttachError] = useState<string | null>(null);

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttachError(null);
    try {
      const parsed = await readPromptAttachments(files);
      onAttachmentsChange([...attachments, ...parsed].slice(0, 4));
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : 'Could not attach selected file.');
    } finally {
      e.target.value = '';
    }
  };

  const defaultPlaceholder =
    capability === 'chat'
      ? 'Ask anything, brainstorm an idea, or upload an image/file to analyze...'
      : capability === 'create_3d'
      ? 'Describe an interactive 3D world, product showcase, animation, or 3D game...'
      : capability === 'image'
      ? 'Describe the image or visual concept you want Zuno AI to generate...'
      : 'Describe a website, web app, dashboard, or interactive experience to build...';

  const submitLabel =
    capability === 'chat'
      ? 'Ask Zuno'
      : capability === 'create_3d'
      ? 'Create 3D'
      : capability === 'image'
      ? 'Create Image'
      : 'Start Building';

  return (
    <div className="composer-frame">
      <div className="composer-surface">
        <div className="chip-row" role="group" aria-label="Workspace mode">
          {CAPABILITY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isBusy}
                className={`chip ${capability === opt.id ? 'selected' : ''}`}
                onClick={() => onCapabilityChange(opt.id)}
              >
                <Icon size={15} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <textarea
          className="composer-textarea"
          value={promptText}
          disabled={isBusy}
          placeholder={placeholder ?? defaultPlaceholder}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (promptText.trim() && !isBusy) onSubmit();
            }
          }}
        />

        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {attachments.map((att) => (
              <div key={att.id} className="attachment-chip">
                {att.previewUrl && (
                  <img src={att.previewUrl} alt={att.name} className="attachment-thumb" />
                )}
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {att.name}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onAttachmentsChange(attachments.filter((item) => item.id !== att.id))
                  }
                  aria-label={`Remove ${att.name}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 2,
                    cursor: 'pointer',
                    display: 'inline-flex',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {attachError && (
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--rose)' }}>{attachError}</p>
        )}

        <div className="composer-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.txt,.md,.json,.csv,.html,.css,.js,.ts"
              style={{ display: 'none' }}
              onChange={handleFilePick}
            />
            <button
              type="button"
              className="btn-outline"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
              style={{ minHeight: 40, padding: '6px 12px', fontSize: '0.82rem' }}
            >
              <Paperclip size={15} />
              <span>Attach</span>
            </button>

          </div>

          <button
            type="button"
            className="btn-primary"
            disabled={!promptText.trim() || isBusy}
            onClick={onSubmit}
            style={{ minHeight: 44, padding: '8px 18px', borderRadius: 12 }}
          >
            {isBusy ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                <span>{busyLabel || 'Working...'}</span>
              </>
            ) : (
              <>
                <span>{submitLabel}</span>
                <ArrowUp size={17} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
