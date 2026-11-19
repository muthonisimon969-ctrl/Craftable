import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, Box, Minimize2, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import type { ConsoleEntry } from '../types/project';
import {
  assembleCreativePreviewDocument,
  loadThreeRuntimeSource,
} from '../utils/creativeBundleAssembler';

interface CreativePreviewPaneProps {
  title: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  isRunning: boolean;
  reloadNonce: number;
  isFullscreen: boolean;
  runtimeError: string | null;
  consoleLogs: ConsoleEntry[];
  showConsoleSheet: boolean;
  onStart: () => void;
  onRestart: () => void;
  onToggleFullscreen: () => void;
  onRuntimeError: (msg: string) => void;
  onAskAiFixError: (errMsg: string) => void;
  onDismissConsole: () => void;
  onClearConsole: () => void;
  onConsoleMessage: (level: ConsoleEntry['level'], message: string) => void;
}

export function CreativePreviewPane({
  title,
  htmlCode,
  cssCode,
  jsCode,
  isRunning,
  reloadNonce,
  isFullscreen,
  runtimeError,
  consoleLogs,
  showConsoleSheet,
  onStart,
  onRestart,
  onToggleFullscreen,
  onRuntimeError,
  onAskAiFixError,
  onDismissConsole,
  onClearConsole,
  onConsoleMessage,
}: CreativePreviewPaneProps) {
  const channelId = useId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [threeRuntimeText, setThreeRuntimeText] = useState<string | null>(null);
  const [runtimeLoaded, setRuntimeLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadThreeRuntimeSource().then((text) => {
      if (!active) return;
      setThreeRuntimeText(text);
      setRuntimeLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const srcDoc = useMemo(() => {
    if (!isRunning || !runtimeLoaded) return '';
    return assembleCreativePreviewDocument(
      title,
      htmlCode,
      cssCode,
      jsCode,
      channelId,
      originUrl,
      threeRuntimeText
    );
  }, [isRunning, runtimeLoaded, title, htmlCode, cssCode, jsCode, channelId, originUrl, threeRuntimeText]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
        return;
      }
      const data = event.data as {
        type?: string;
        channel?: string;
        level?: ConsoleEntry['level'];
        message?: string;
      } | null;
      if (!data || data.channel !== channelId || !data.message) return;

      if (data.type === 'zuno-creative-console') {
        onConsoleMessage(data.level ?? 'LOG', data.message);
      } else if (data.type === 'zuno-creative-error') {
        onRuntimeError(data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [channelId, onConsoleMessage, onRuntimeError]);

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
      <div className="preview-wrap" style={{ background: '#070B14' }}>
        {!isRunning ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              textAlign: 'center',
              gap: 14,
              color: 'var(--text)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: 'var(--surface-container)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--coral)',
              }}
            >
              <Box size={30} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: '1.15rem' }}>3D Viewport Stopped</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 340 }}>
                WebGL execution is paused cleanly. Click Run to launch &ldquo;{title}&rdquo; inside the isolated 3D sandbox.
              </p>
            </div>
            <button type="button" className="btn-primary" onClick={onStart}>
              <Play size={18} />
              <span>Run 3D Scene</span>
            </button>
          </div>
        ) : !runtimeLoaded ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              color: 'var(--text-muted)',
            }}
          >
            <span className="spinner" style={{ width: 28, height: 28, color: 'var(--coral)' }} />
            <span>Initializing Three.js runtime...</span>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key={`${reloadNonce}-${channelId}`}
            title={`${title} isolated Three.js preview`}
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-forms allow-modals"
            className="preview-iframe"
            style={{ background: '#070B14' }}
          />
        )}

        {runtimeError && isRunning && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 12,
              zIndex: 40,
              background: 'rgba(15, 20, 34, 0.94)',
              border: '1px solid rgba(244, 63, 94, 0.55)',
              borderRadius: 14,
              padding: 12,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 220px', minWidth: 0 }}>
              <AlertCircle size={18} style={{ color: 'var(--rose)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.84rem', color: '#f8fafc', wordBreak: 'break-word' }}>
                {runtimeError}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn-outline"
                onClick={onRestart}
                style={{ minHeight: 40, padding: '6px 12px', color: '#fff' }}
              >
                <RotateCcw size={15} />
                <span>Restart</span>
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onAskAiFixError(runtimeError)}
                style={{ minHeight: 40, padding: '6px 12px' }}
              >
                <Sparkles size={15} />
                <span>Ask AI to Fix</span>
              </button>
            </div>
          </div>
        )}

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
          aria-label="Creative Studio Console"
          onClick={onDismissConsole}
        >
          <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Creative Studio Console</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button type="button" className="btn-outline" onClick={onClearConsole}>
                  Clear
                </button>
                <button type="button" className="icon-btn" onClick={onDismissConsole} aria-label="Close console">
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
                No Three.js logs or errors yet. Interact with the 3D preview to inspect runtime messages.
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
                      <span className="font-mono" style={{ color, fontWeight: 700, minWidth: 46 }}>
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
