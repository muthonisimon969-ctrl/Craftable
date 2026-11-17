import { useEffect, useId, useMemo } from 'react';
import { Minimize2, X } from 'lucide-react';
import type { ConsoleEntry } from '../types/project';
import { assemblePreviewDocument } from '../utils/webBundleAssembler';

interface WebPreviewPaneProps {
  title: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  reloadNonce: number;
  isFullscreen: boolean;
  consoleLogs: ConsoleEntry[];
  showConsoleSheet: boolean;
  onToggleFullscreen: () => void;
  onDismissConsole: () => void;
  onClearConsole: () => void;
  onConsoleMessage: (level: ConsoleEntry['level'], message: string) => void;
}

export function WebPreviewPane({
  title,
  htmlCode,
  cssCode,
  jsCode,
  reloadNonce,
  isFullscreen,
  consoleLogs,
  showConsoleSheet,
  onToggleFullscreen,
  onDismissConsole,
  onClearConsole,
  onConsoleMessage,
}: WebPreviewPaneProps) {
  const channelId = useId();

  const srcDoc = useMemo(
    () => assemblePreviewDocument(title, htmlCode, cssCode, jsCode, channelId),
    [title, htmlCode, cssCode, jsCode, channelId]
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        channel?: string;
        level?: ConsoleEntry['level'];
        message?: string;
      } | null;
      if (data?.type === 'craftable-console' && data.channel === channelId && data.message) {
        onConsoleMessage(data.level ?? 'LOG', data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [channelId, onConsoleMessage]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen, onToggleFullscreen]);

  return (
    <>
      <div className="preview-wrap">
        <iframe
          key={`${reloadNonce}-${channelId}`}
          title={`${title} live preview`}
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
          className="preview-iframe"
        />

        {isFullscreen && (
          <button
            type="button"
            className="btn-tonal exit-fullscreen-btn"
            onClick={onToggleFullscreen}
          >
            <Minimize2 size={18} />
            <span>Exit Fullscreen</span>
          </button>
        )}
      </div>

      {showConsoleSheet && (
        <div
          className="modal-backdrop sheet-bottom"
          role="dialog"
          aria-modal="true"
          aria-label="Preview Console"
          onClick={onDismissConsole}
        >
          <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Preview Console</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button type="button" className="btn-outline" onClick={onClearConsole}>
                  Clear
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={onDismissConsole}
                  aria-label="Close console"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {consoleLogs.length === 0 ? (
              <div
                style={{
                  background: 'var(--surface-high)',
                  borderRadius: 14,
                  padding: 16,
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                No console output yet. Interact with the live preview to see logs or runtime errors.
              </div>
            ) : (
              <div
                style={{
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  maxHeight: '46dvh',
                }}
              >
                {consoleLogs.map((entry) => {
                  const color =
                    entry.level === 'ERROR'
                      ? 'var(--rose)'
                      : entry.level === 'WARN'
                      ? 'var(--amber)'
                      : 'var(--emerald)';
                  return (
                    <div
                      key={entry.id}
                      style={{
                        background: 'var(--surface-high)',
                        borderRadius: 10,
                        padding: '9px 12px',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        fontSize: '0.82rem',
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{ color, fontWeight: 700, minWidth: 46 }}
                      >
                        {entry.level}
                      </span>
                      <span className="font-mono" style={{ wordBreak: 'break-word' }}>
                        {entry.message}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
