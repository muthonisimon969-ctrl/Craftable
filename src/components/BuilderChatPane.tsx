import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Send, Sparkles } from 'lucide-react';
import type { ProjectMessage } from '../types/project';

interface BuilderChatPaneProps {
  messages: ProjectMessage[];
  promptInput: string;
  isGenerating: boolean;
  generationStage: string;
  followUpSuggestions: string[];
  pendingUserPrompt: string | null;
  failedUserPrompt: string | null;
  errorMessage: string | null;
  onPromptChanged: (value: string) => void;
  onSendPrompt: () => void;
  onTapSuggestion: (suggestion: string) => void;
  onRetryFailedPrompt: () => void;
  onDismissError: () => void;
  onOpenPreview?: () => void;
}

export function BuilderChatPane({
  messages,
  promptInput,
  isGenerating,
  generationStage,
  followUpSuggestions,
  pendingUserPrompt,
  failedUserPrompt,
  errorMessage,
  onPromptChanged,
  onSendPrompt,
  onTapSuggestion,
  onRetryFailedPrompt,
  onDismissError,
  onOpenPreview,
}: BuilderChatPaneProps) {
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isGenerating, pendingUserPrompt, errorMessage]);

  const latestAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')?.id;

  return (
    <div className="chat-pane">
      <div className="chat-feed">
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="bubble-user">
              {msg.content}
            </div>
          ) : (
            <div key={msg.id} className="card-assistant">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.16)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--emerald)',
                    }}
                  >
                    <CheckCircle2 size={15} />
                  </span>
                  <strong className="font-display" style={{ fontSize: '0.94rem' }}>
                    Craftable Agent
                  </strong>
                </div>
                <span className="badge font-mono">v{msg.versionTag}</span>
              </div>

              <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </p>

              {msg.filesChanged.length > 0 && (
                <div className="chip-row">
                  {msg.filesChanged.map((fileName) => (
                    <span key={fileName} className="badge badge-neutral font-mono">
                      {fileName}
                    </span>
                  ))}
                </div>
              )}

              {onOpenPreview && msg.id === latestAssistantId && (
                <button
                  type="button"
                  className="btn-tonal"
                  onClick={onOpenPreview}
                  style={{ width: '100%' }}
                >
                  Open Full Live Preview
                </button>
              )}
            </div>
          )
        )}

        {pendingUserPrompt && <div className="bubble-user">{pendingUserPrompt}</div>}

        {isGenerating && (
          <div
            className="card-assistant"
            style={{ borderColor: 'rgba(255, 94, 91, 0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="spinner" style={{ color: 'var(--coral)' }} />
              <div>
                <div className="font-display" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  Craftable AI is working...
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {generationStage || 'Waiting for Craft AI response...'}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isGenerating && errorMessage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {failedUserPrompt && <div className="bubble-user">{failedUserPrompt}</div>}
            <div className="error-card">
              <div className="error-title">
                <AlertCircle size={18} />
                <span>Craft AI did not complete this reply</span>
              </div>
              <p className="error-body">{errorMessage}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {failedUserPrompt && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={onRetryFailedPrompt}
                  >
                    <RefreshCw size={16} />
                    <span>Retry</span>
                  </button>
                )}
                <button type="button" className="btn-outline" onClick={onDismissError}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={feedEndRef} />
      </div>

      {!isGenerating && followUpSuggestions.length > 0 && (
        <div className="chip-row" style={{ padding: '6px 14px' }}>
          {followUpSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="chip"
              onClick={() => onTapSuggestion(suggestion)}
            >
              <Sparkles size={14} style={{ color: 'var(--coral)' }} />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      <div className="chat-composer">
        <textarea
          className="chat-input"
          rows={1}
          value={promptInput}
          disabled={isGenerating}
          placeholder="Tell Craftable what to build or change..."
          onChange={(e) => onPromptChanged(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (promptInput.trim() && !isGenerating) {
                onSendPrompt();
              }
            }
          }}
        />
        <button
          type="button"
          className="btn-primary"
          disabled={!promptInput.trim() || isGenerating}
          onClick={onSendPrompt}
          aria-label="Send build prompt"
          style={{
            minWidth: 46,
            minHeight: 46,
            padding: 0,
            borderRadius: 14,
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
