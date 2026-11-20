import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Box,
  Hammer,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { AppNavigation, type NavSection } from '../components/AppNavigation';
import type { ChatThreadMessage, PromptAttachment } from '../types/project';
import { readPromptAttachments } from '../utils/attachmentReader';

interface ChatStudioPageProps {
  messages: ChatThreadMessage[];
  isDarkTheme: boolean;
  isServerAiReady: boolean;
  isReplying: boolean;
  isBuilding: boolean;
  buildStatus: string;
  errorMessage: string | null;
  onNavigate: (section: NavSection) => void;
  onToggleTheme: () => void;
  onSendMessage: (text: string, attachments: PromptAttachment[]) => Promise<void>;
  onClearChat: () => void;
  onDismissError: () => void;
  onHandOffToBuild: (prompt: string) => void;
  onHandOffTo3d: (prompt: string) => void;
}

export function ChatStudioPage({
  messages,
  isDarkTheme,
  isServerAiReady,
  isReplying,
  isBuilding,
  buildStatus,
  errorMessage,
  onNavigate,
  onToggleTheme,
  onSendMessage,
  onClearChat,
  onDismissError,
  onHandOffToBuild,
  onHandOffTo3d,
}: ChatStudioPageProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [attachErr, setAttachErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isReplying, isBuilding]);

  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttachErr(null);
    try {
      const parsed = await readPromptAttachments(files);
      setAttachments((prev) => [...prev, ...parsed].slice(0, 4));
    } catch (err) {
      setAttachErr(err instanceof Error ? err.message : 'Could not read attachment.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isReplying || isBuilding) return;
    const currentAttachments = attachments;
    setInput('');
    setAttachments([]);
    await onSendMessage(trimmed, currentAttachments);
  };

  return (
    <div className="workspace-shell">
      <AppNavigation
        activeSection="chat"
        isDarkTheme={isDarkTheme}
        isServerAiReady={isServerAiReady}
        onNavigate={onNavigate}
        onToggleTheme={onToggleTheme}
      />

      <div className="zuno-chat-body">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={17} style={{ color: 'var(--coral)' }} />
            <strong className="font-display">Chat &amp; Think</strong>
            <span className="badge badge-neutral">Reasoning &bull; Multimodal</span>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              className="btn-outline"
              onClick={onClearChat}
              disabled={isReplying || isBuilding}
              style={{ minHeight: 36, padding: '4px 10px', fontSize: '0.78rem' }}
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="chat-feed">
          {messages.length === 0 && !isReplying && (
            <div className="empty-card" style={{ marginTop: 24 }}>
              <Sparkles size={32} style={{ color: 'var(--coral)' }} />
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Think through any idea with Zuno AI</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 460 }}>
                Ask questions, upload screenshots or code files to analyze, plan architecture, or turn any idea straight into a live website or 3D scene.
              </p>
            </div>
          )}

          {messages.map((msg) =>
            msg.role === 'user' ? (
              <div key={msg.id} className="bubble-user">
                {msg.content}
                {msg.attachmentNames && msg.attachmentNames.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: '0.75rem', opacity: 0.85 }}>
                    Attached: {msg.attachmentNames.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <div key={msg.id} className="card-assistant">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong className="font-display" style={{ fontSize: '0.94rem' }}>
                    Zuno AI
                  </strong>
                  <span className="badge badge-neutral">Chat</span>
                </div>

                <p style={{ margin: 0, fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>{msg.content}</p>

                {msg.suggestedBuildPrompt && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      paddingTop: 6,
                      borderTop: '1px solid var(--border-soft)',
                    }}
                  >
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={isBuilding || isReplying}
                      onClick={() => onHandOffToBuild(msg.suggestedBuildPrompt!)}
                      style={{ minHeight: 40, padding: '6px 12px', fontSize: '0.84rem' }}
                    >
                      <Hammer size={15} />
                      <span>Build App from Idea</span>
                    </button>
                    <button
                      type="button"
                      className="btn-tonal"
                      disabled={isBuilding || isReplying}
                      onClick={() => onHandOffTo3d(msg.suggestedBuildPrompt!)}
                      style={{ minHeight: 40, padding: '6px 12px', fontSize: '0.84rem' }}
                    >
                      <Box size={15} />
                      <span>Create 3D Experience</span>
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {(isReplying || isBuilding) && (
            <div className="card-assistant">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="spinner" style={{ color: 'var(--coral)' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {isBuilding ? buildStatus || 'Building project with Zuno AI...' : 'Zuno AI is thinking...'}
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="error-card">
              <div className="error-title">
                <AlertCircle size={17} />
                <span>Zuno AI Error</span>
              </div>
              <p className="error-body">{errorMessage}</p>
              <button type="button" className="btn-outline" onClick={onDismissError} style={{ alignSelf: 'flex-start' }}>
                Dismiss
              </button>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div style={{ padding: '0 12px' }}>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {attachments.map((att) => (
                <div key={att.id} className="attachment-chip">
                  {att.previewUrl && (
                    <img src={att.previewUrl} alt={att.name} className="attachment-thumb" />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {att.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                    aria-label={`Remove ${att.name}`}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {attachErr && <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: 'var(--rose)' }}>{attachErr}</p>}

          <div className="chat-composer" style={{ margin: 0 }}>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.txt,.md,.json,.csv,.html,.css,.js,.ts"
              style={{ display: 'none' }}
              onChange={handleAttach}
            />
            <button
              type="button"
              className="icon-btn"
              disabled={isReplying || isBuilding}
              onClick={() => fileRef.current?.click()}
              aria-label="Attach image or file"
              title="Attach image or file"
            >
              <Paperclip size={18} />
            </button>
            <textarea
              className="chat-input"
              rows={1}
              value={input}
              disabled={isReplying || isBuilding}
              placeholder="Ask Zuno AI anything or attach a file to analyze..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={!input.trim() || isReplying || isBuilding}
              onClick={handleSubmit}
              aria-label="Send message"
              style={{ minWidth: 46, minHeight: 46, padding: 0, borderRadius: 14 }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
