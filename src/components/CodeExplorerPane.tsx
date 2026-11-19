import { useState } from 'react';
import { Check, Copy, Play } from 'lucide-react';
import type { CodeFileTab } from '../types/project';

interface CodeExplorerPaneProps {
  selectedFile: CodeFileTab;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  jsFileLabel?: string;
  onSelectFile: (tab: CodeFileTab) => void;
  onCodeChanged: (code: string) => void;
  onSaveAndRun: () => void;
}

export function CodeExplorerPane({
  selectedFile,
  htmlCode,
  cssCode,
  jsCode,
  hasUnsavedChanges,
  isSaving,
  jsFileLabel = 'app.js',
  onSelectFile,
  onCodeChanged,
  onSaveAndRun,
}: CodeExplorerPaneProps) {
  const [copied, setCopied] = useState(false);

  const fileTabs: Array<{ id: CodeFileTab; label: string; dotColor: string }> = [
    { id: 'index.html', label: 'index.html', dotColor: 'var(--coral)' },
    { id: 'styles.css', label: 'styles.css', dotColor: 'var(--indigo)' },
    { id: 'app.js', label: jsFileLabel, dotColor: 'var(--amber)' },
  ];

  const displayName = selectedFile === 'app.js' ? jsFileLabel : selectedFile;

  const activeCode =
    selectedFile === 'index.html'
      ? htmlCode
      : selectedFile === 'styles.css'
      ? cssCode
      : jsCode;

  const lines = activeCode.split('\n');
  const lineCount = Math.max(1, lines.length);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-pane">
      <div className="chip-row">
        {fileTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`chip font-mono ${selectedFile === tab.id ? 'selected' : ''}`}
            onClick={() => onSelectFile(tab.id)}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: tab.dotColor,
                display: 'inline-block',
              }}
            />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="code-surface">
        <div className="code-toolbar">
          <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {displayName} &bull; {lineCount} lines
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="icon-btn"
              onClick={handleCopy}
              aria-label={`Copy ${selectedFile}`}
              title={`Copy ${selectedFile}`}
              style={{ minWidth: 40, minHeight: 40 }}
            >
              {copied ? <Check size={17} style={{ color: 'var(--emerald)' }} /> : <Copy size={17} />}
            </button>

            {hasUnsavedChanges && (
              <button
                type="button"
                className="btn-primary"
                disabled={isSaving}
                onClick={onSaveAndRun}
                style={{ minHeight: 40, padding: '6px 14px', fontSize: '0.84rem' }}
              >
                {isSaving ? (
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                ) : (
                  <>
                    <Play size={15} />
                    <span>Save &amp; Run</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="code-editor-scroll">
          <div className="line-gutter" aria-hidden="true">
            {Array.from({ length: lineCount }, (_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>
          <textarea
            className="code-textarea"
            value={activeCode}
            spellCheck={false}
            rows={Math.max(18, lineCount)}
            onChange={(e) => onCodeChanged(e.target.value)}
            aria-label={`${selectedFile} source code`}
          />
        </div>
      </div>
    </div>
  );
}
