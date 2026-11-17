import { useState } from 'react';
import { KeyRound, Trash2, X } from 'lucide-react';

interface RenameModalProps {
  initialTitle: string;
  initialDescription: string;
  onDismiss: () => void;
  onConfirm: (title: string, description: string) => void;
}

export function RenameProjectModal({
  initialTitle,
  initialDescription,
  onDismiss,
  onConfirm,
}: RenameModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onDismiss}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Rename Project</h2>
          <button type="button" className="icon-btn" onClick={onDismiss} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
          <span>Project name</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              minHeight: 46,
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
          <span>Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              resize: 'vertical',
            }}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn-outline" onClick={onDismiss}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!title.trim()}
            onClick={() => onConfirm(title, description)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  projectTitle: string;
  onDismiss: () => void;
  onConfirm: () => void;
}

export function DeleteProjectModal({ projectTitle, onDismiss, onConfirm }: DeleteModalProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onDismiss}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Delete &ldquo;{projectTitle}&rdquo;?</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          This will permanently remove the project code and conversation history from this browser.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn-outline" onClick={onDismiss}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: 'var(--rose)' }}
            onClick={onConfirm}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface CraftAiKeyModalProps {
  currentKey: string;
  onDismiss: () => void;
  onSaveKey: (key: string) => void;
}

export function CraftAiKeyModal({ currentKey, onDismiss, onSaveKey }: CraftAiKeyModalProps) {
  const [keyInput, setKeyInput] = useState(currentKey);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onDismiss}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyRound size={20} style={{ color: 'var(--coral)' }} />
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Craft AI Connection</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onDismiss} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          On Vercel, Craft AI uses your server <code className="font-mono">GEMINI_API_KEY</code>{' '}
          environment variable automatically. For local browser use or personal testing, you can
          save a Gemini API key in your browser below.
        </p>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
          <span>Personal Gemini API Key (optional)</span>
          <input
            type="password"
            value={keyInput}
            placeholder="AIza..."
            onChange={(e) => setKeyInput(e.target.value)}
            style={{
              minHeight: 46,
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
            }}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          {currentKey ? (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                onSaveKey('');
                onDismiss();
              }}
            >
              Clear Key
            </button>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-outline" onClick={onDismiss}>
              Close
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onSaveKey(keyInput);
                onDismiss();
              }}
            >
              Save Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
