import { AlertCircle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { AppNavigation, type NavSection } from '../components/AppNavigation';
import { PromptComposer } from '../components/PromptComposer';
import type { PromptAttachment, StudioCapability } from '../types/project';

interface HomePageProps {
  isDarkTheme: boolean;
  isServerAiReady: boolean;
  isBusy: boolean;
  busyStatus: string;
  errorMessage: string | null;
  promptText: string;
  capability: StudioCapability;
  attachments: PromptAttachment[];
  projectCount: number;
  onNavigate: (section: NavSection) => void;
  onToggleTheme: () => void;
  onPromptChange: (text: string) => void;
  onCapabilityChange: (cap: StudioCapability) => void;
  onAttachmentsChange: (items: PromptAttachment[]) => void;
  onSubmitPrompt: () => Promise<void>;
  onDismissError: () => void;
}

const SPARK_IDEAS: Array<{ label: string; prompt: string; cap: StudioCapability }> = [
  {
    label: 'Modern portfolio website',
    prompt: 'Build a minimalist creative director portfolio website with dark editorial typography and interactive case studies.',
    cap: 'build',
  },
  {
    label: '3D product showcase',
    prompt: 'Create an interactive 3D sneaker product showcase in Three.js with studio lighting, color switcher, and OrbitControls.',
    cap: 'create_3d',
  },
  {
    label: '3D Kenyan rally game',
    prompt: 'Create a 3D racing game with Kenyan roads, Rift Valley mountains, acacia trees, and mobile touch controls.',
    cap: 'create_3d',
  },
  {
    label: 'Brainstorm a SaaS idea',
    prompt: 'Help me architect an AI-assisted invoice & inventory web app for small retail teams.',
    cap: 'chat',
  },
];

export function HomePage({
  isDarkTheme,
  isServerAiReady,
  isBusy,
  busyStatus,
  errorMessage,
  promptText,
  capability,
  attachments,
  projectCount,
  onNavigate,
  onToggleTheme,
  onPromptChange,
  onCapabilityChange,
  onAttachmentsChange,
  onSubmitPrompt,
  onDismissError,
}: HomePageProps) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <AppNavigation
        activeSection="home"
        isDarkTheme={isDarkTheme}
        isServerAiReady={isServerAiReady}
        onNavigate={onNavigate}
        onToggleTheme={onToggleTheme}
      />

      <main className="zuno-home-canvas zuno-home-redesign">
        <div className="zuno-ambient-glow" aria-hidden="true" />

        <div className="zuno-home-center">
          <div className="zuno-philosophy-pill">
            <Sparkles size={14} style={{ color: 'var(--coral)' }} />
            <span>Your ideas, brought to life</span>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h1 className="zuno-headline">What will you create today?</h1>
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(0.95rem, 1.8vw, 1.08rem)',
                color: 'var(--text-muted)',
              }}
            >
              From a first thought to a working experience — create it with Zuno AI.
            </p>
          </div>

          <PromptComposer
            promptText={promptText}
            capability={capability}
            attachments={attachments}
            isBusy={isBusy}
            busyLabel={busyStatus}
            onPromptChange={(val) => {
              onPromptChange(val);
              if (errorMessage) onDismissError();
            }}
            onCapabilityChange={onCapabilityChange}
            onAttachmentsChange={onAttachmentsChange}
            onSubmit={onSubmitPrompt}
          />

          {errorMessage && (
            <div className="error-card" style={{ width: '100%' }}>
              <div className="error-title">
                <AlertCircle size={18} />
                <span>Zuno AI could not complete this request</span>
              </div>
              <p className="error-body">{errorMessage}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={onSubmitPrompt}
                  disabled={isBusy}
                >
                  <RefreshCw size={15} />
                  <span>Retry</span>
                </button>
                <button type="button" className="btn-outline" onClick={onDismissError}>
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
            }}
          >
            {SPARK_IDEAS.map((idea) => (
              <button
                key={idea.label}
                type="button"
                className="chip"
                disabled={isBusy}
                onClick={() => {
                  onCapabilityChange(idea.cap);
                  onPromptChange(idea.prompt);
                  onDismissError();
                }}
              >
                <span>{idea.label}</span>
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              flexWrap: 'wrap',
              paddingTop: 6,
              fontSize: '0.86rem',
              color: 'var(--text-muted)',
            }}
          >
            {projectCount > 0 && (
              <button
                type="button"
                className="btn-outline"
                onClick={() => onNavigate('projects')}
                style={{ minHeight: 40, padding: '6px 14px' }}
              >
                <span>Open your projects ({projectCount})</span>
                <ArrowRight size={15} />
              </button>
            )}
            <button
              type="button"
              className="btn-outline"
              onClick={() => onNavigate('create')}
              style={{ minHeight: 40, padding: '6px 14px' }}
            >
              <span>Open Create Studio</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
