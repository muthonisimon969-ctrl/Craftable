import type { AppProject } from '../types/project';
import { extractBodyIfFullDocument } from './webBundleAssembler';

let cachedThreeRuntimePromise: Promise<string | null> | null = null;

export function loadThreeRuntimeSource(): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!cachedThreeRuntimePromise) {
    cachedThreeRuntimePromise = fetch('/vendor/three-studio-runtime.js', { cache: 'force-cache' })
      .then((res) => (res.ok ? res.text() : null))
      .catch(() => null);
  }
  return cachedThreeRuntimePromise;
}

function escapeTitle(title: string): string {
  return title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeInlineScript(code: string): string {
  return code.replace(/<\/script/gi, '<\\/script');
}

export function assembleCreativePreviewDocument(
  title: string,
  htmlCode: string,
  cssCode: string,
  jsCode: string,
  channelId: string,
  originUrl: string,
  inlineThreeRuntime?: string | null
): string {
  const cleanBody = extractBodyIfFullDocument(htmlCode);
  const escapedTitle = escapeTitle(title || 'Zuno Creative Studio 3D');
  const safeJs = escapeInlineScript(jsCode);
  const runtimeTag = inlineThreeRuntime
    ? `<script>${escapeInlineScript(inlineThreeRuntime)}</script>`
    : `<script src="${originUrl}/vendor/three-studio-runtime.js"></script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${escapedTitle}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #070b14;
      color: #f4f6fb;
      font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    canvas { display: block; outline: none; }
    button, [role="button"] {
      min-height: 44px;
      touch-action: manipulation;
    }
    #__zuno_runtime_err {
      position: fixed;
      inset: 16px;
      z-index: 99999;
      display: none;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }
    #__zuno_runtime_err.visible { display: flex; }
    #__zuno_runtime_err .err-box {
      max-width: 460px;
      width: 100%;
      background: rgba(15, 20, 34, 0.94);
      border: 1px solid rgba(244, 63, 94, 0.55);
      border-radius: 16px;
      padding: 18px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(12px);
    }
    #__zuno_runtime_err h3 { margin: 0 0 6px; font-size: 1rem; color: #fb7185; }
    #__zuno_runtime_err p { margin: 0; font-size: 0.85rem; line-height: 1.45; color: #e2e8f0; word-break: break-word; }
    ${cssCode}
  </style>
</head>
<body>
  ${cleanBody}
  <div id="__zuno_runtime_err" role="alert">
    <div class="err-box">
      <h3>3D Scene Runtime Notice</h3>
      <p id="__zuno_runtime_err_msg"></p>
    </div>
  </div>
  <script>
    (function() {
      var CHANNEL = ${JSON.stringify(channelId)};
      function postToHost(payload) {
        try {
          window.parent.postMessage(Object.assign({ channel: CHANNEL }, payload), '*');
        } catch (e) {}
      }
      function sendLog(level, args) {
        var msg = Array.prototype.slice.call(args).map(function(a) {
          if (typeof a === 'object' && a !== null) {
            try { return JSON.stringify(a); } catch (e) { return String(a); }
          }
          return String(a);
        }).join(' ');
        postToHost({ type: 'zuno-creative-console', level: level, message: msg });
      }
      function showErrorBox(msg) {
        var box = document.getElementById('__zuno_runtime_err');
        var text = document.getElementById('__zuno_runtime_err_msg');
        if (box && text) {
          text.textContent = msg;
          box.classList.add('visible');
        }
        postToHost({ type: 'zuno-creative-error', message: msg });
      }
      var origLog = console.log;
      var origWarn = console.warn;
      var origErr = console.error;
      console.log = function() { sendLog('LOG', arguments); origLog.apply(console, arguments); };
      console.warn = function() { sendLog('WARN', arguments); origWarn.apply(console, arguments); };
      console.error = function() { sendLog('ERROR', arguments); origErr.apply(console, arguments); };
      window.addEventListener('error', function(e) {
        var detail = (e.message || 'Scene error') + (e.lineno ? ' (line ' + e.lineno + ')' : '');
        sendLog('ERROR', [detail]);
        showErrorBox(detail);
      });
      window.addEventListener('unhandledrejection', function(e) {
        var detail = 'Async error: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason));
        sendLog('ERROR', [detail]);
        showErrorBox(detail);
      });
      window.__zunoReportError = showErrorBox;
    })();
  </script>
  ${runtimeTag}
  <script>
    (function() {
      if (typeof window.THREE === 'undefined') {
        if (window.__zunoReportError) {
          window.__zunoReportError('Three.js runtime failed to load. Click Restart to retry.');
        }
        return;
      }
      try {
        ${safeJs}
      } catch (err) {
        var msg = err && err.message ? err.message : String(err);
        console.error(msg);
        if (window.__zunoReportError) {
          window.__zunoReportError(msg);
        }
      }
    })();
  </script>
</body>
</html>`;
}

export function assembleCreativeStandaloneExport(
  title: string,
  htmlCode: string,
  cssCode: string,
  jsCode: string,
  inlineThreeRuntime?: string | null
): string {
  const cleanBody = extractBodyIfFullDocument(htmlCode);
  const escapedTitle = escapeTitle(title || 'Zuno Creative Studio 3D');
  const safeJs = escapeInlineScript(jsCode);

  const threeScriptBlock = inlineThreeRuntime
    ? `<script>${escapeInlineScript(inlineThreeRuntime)}</script>`
    : `<script src="https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.min.js"></script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapedTitle} — Zuno Creative Studio</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #070b14;
      color: #f4f6fb;
      font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    }
    canvas { display: block; outline: none; }
${cssCode}
  </style>
</head>
<body>
${cleanBody}
  ${threeScriptBlock}
  <script>
${safeJs}
  </script>
</body>
</html>`;
}

export function buildCreativeJsonExport(project: AppProject): string {
  const files = {
    'index.html': extractBodyIfFullDocument(project.htmlCode),
    'styles.css': project.cssCode,
    'scene.js': project.jsCode,
  };
  return JSON.stringify(
    {
      studio: 'Zuno Creative Studio (Three.js)',
      title: project.title,
      description: project.description,
      category: project.creativeCategory ?? '3d_game',
      version: project.version,
      exportedAt: new Date().toISOString(),
      files,
    },
    null,
    2
  );
}
