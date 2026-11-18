export function extractBodyIfFullDocument(rawHtml: string): string {
  const match = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(rawHtml);
  return match?.[1]?.trim() || rawHtml.trim();
}

function escapeTitle(title: string): string {
  return title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function assemblePreviewDocument(
  title: string,
  htmlCode: string,
  cssCode: string,
  jsCode: string,
  channelId: string
): string {
  const cleanBody = extractBodyIfFullDocument(htmlCode);
  const escapedTitle = escapeTitle(title || 'Zuno AI Preview');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapedTitle}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { font-size: 16px; scroll-behavior: smooth; }
    html, body {
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    button, [role="button"], input, select, textarea {
      min-height: 44px;
      font-size: 1rem;
      touch-action: manipulation;
    }
    img, svg { max-width: 100%; height: auto; }
    ${cssCode}
  </style>
</head>
<body>
  ${cleanBody}
  <script>
    (function() {
      var CHANNEL = ${JSON.stringify(channelId)};
      function sendLog(level, args) {
        try {
          var msg = Array.prototype.slice.call(args).map(function(a) {
            if (typeof a === 'object' && a !== null) {
              try { return JSON.stringify(a); } catch (e) { return String(a); }
            }
            return String(a);
          }).join(' ');
          window.parent.postMessage({ type: 'zuno-console', channel: CHANNEL, level: level, message: msg }, '*');
        } catch (e) {}
      }
      var origLog = console.log;
      var origWarn = console.warn;
      var origErr = console.error;
      console.log = function() { sendLog('LOG', arguments); origLog.apply(console, arguments); };
      console.warn = function() { sendLog('WARN', arguments); origWarn.apply(console, arguments); };
      console.error = function() { sendLog('ERROR', arguments); origErr.apply(console, arguments); };
      window.addEventListener('error', function(e) {
        sendLog('ERROR', [(e.message || 'Script error') + (e.lineno ? ' (line ' + e.lineno + ')' : '')]);
      });
      window.addEventListener('unhandledrejection', function(e) {
        sendLog('ERROR', ['Unhandled Promise rejection: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason))]);
      });
    })();
  </script>
  <script>
    ${jsCode}
  </script>
</body>
</html>`;
}

export function assembleStandaloneExport(
  title: string,
  htmlCode: string,
  cssCode: string,
  jsCode: string
): string {
  const cleanBody = extractBodyIfFullDocument(htmlCode);
  const escapedTitle = escapeTitle(title || 'Zuno AI App');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapedTitle} — Built with Zuno AI</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { font-size: 16px; scroll-behavior: smooth; }
    html, body {
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    img, svg { max-width: 100%; height: auto; }
${cssCode}
  </style>
</head>
<body>
${cleanBody}
  <script>
${jsCode}
  </script>
</body>
</html>`;
}
