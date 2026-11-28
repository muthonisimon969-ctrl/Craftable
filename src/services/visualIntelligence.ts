import html2canvas from 'html2canvas';

export interface VisualReviewFinding {
  severity: 'blocker' | 'high' | 'medium' | 'low';
  area: string;
  problem: string;
  recommendation: string;
}

export interface VisualReviewResult {
  score: number;
  verdict: 'ready' | 'needs_polish' | 'needs_repair';
  summary: string;
  strengths: string[];
  findings: VisualReviewFinding[];
  responsiveConcerns: string[];
}

export async function reviewRenderedWebsite(
  frame: HTMLIFrameElement,
  projectTitle: string,
  originalBrief: string,
  consoleErrors: string[] = []
): Promise<VisualReviewResult> {
  const doc = frame.contentDocument;
  if (!doc?.body) throw new Error('The live preview is not ready to inspect.');

  const viewports = [
    { width: 1440, height: 900, label: 'Desktop 1440 × 900' },
    { width: 375, height: 812, label: 'Mobile 375 × 812' },
  ];

  const screenshots = await Promise.all(viewports.map(async (viewport) => {
    const canvas = await html2canvas(doc.documentElement, {
      backgroundColor: null,
      scale: 0.65,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: viewport.width,
      height: viewport.height,
      windowWidth: viewport.width,
      windowHeight: viewport.height,
      scrollX: 0,
      scrollY: 0,
    });
    return {
      viewport: viewport.label,
      screenshot: canvas.toDataURL('image/jpeg', 0.78),
    };
  }));

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 55_000);
  try {
    const response = await fetch('/api/visual-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        projectTitle,
        originalBrief,
        screenshots,
        consoleErrors: consoleErrors.slice(-8),
      }),
    });
    const payload = await response.json().catch(() => null) as {
      review?: VisualReviewResult;
      error?: string;
    } | null;
    if (!response.ok || !payload?.review) {
      throw new Error(payload?.error || 'Visual inspection could not be completed.');
    }
    return payload.review;
  } finally {
    window.clearTimeout(timeout);
  }
}
