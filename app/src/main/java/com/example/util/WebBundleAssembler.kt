package com.example.util

object WebBundleAssembler {

    fun assemblePreviewDocument(
        title: String,
        htmlCode: String,
        cssCode: String,
        jsCode: String,
    ): String {
        val cleanBody = extractBodyIfFullDocument(htmlCode)
        val escapedTitle = title
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>$escapedTitle</title>
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
                $cssCode
              </style>
            </head>
            <body>
              $cleanBody
              <script>
                (function() {
                  function sendLog(level, args) {
                    try {
                      if (window.CraftableBridge && window.CraftableBridge.onConsole) {
                        var msg = Array.prototype.slice.call(args).map(function(a) {
                          if (typeof a === 'object') {
                            try { return JSON.stringify(a); } catch(e) { return String(a); }
                          }
                          return String(a);
                        }).join(' ');
                        window.CraftableBridge.onConsole(level, msg);
                      }
                    } catch(e) {}
                  }
                  var origLog = console.log;
                  var origWarn = console.warn;
                  var origErr = console.error;
                  console.log = function() { sendLog('LOG', arguments); origLog.apply(console, arguments); };
                  console.warn = function() { sendLog('WARN', arguments); origWarn.apply(console, arguments); };
                  console.error = function() { sendLog('ERROR', arguments); origErr.apply(console, arguments); };
                  window.addEventListener('error', function(e) {
                    sendLog('ERROR', [e.message + ' (line ' + e.lineno + ')']);
                  });
                })();
              </script>
              <script>
                $jsCode
              </script>
            </body>
            </html>
        """.trimIndent()
    }

    fun assembleStandaloneExport(
        title: String,
        htmlCode: String,
        cssCode: String,
        jsCode: String,
    ): String {
        val cleanBody = extractBodyIfFullDocument(htmlCode)
        val escapedTitle = title
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>$escapedTitle — Crafted with Craftable</title>
              <style>
                *, *::before, *::after { box-sizing: border-box; }
                html { scroll-behavior: smooth; }
                html, body {
                  margin: 0;
                  padding: 0;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
                  text-rendering: optimizeLegibility;
                }
                img, svg { max-width: 100%; height: auto; }
            $cssCode
              </style>
            </head>
            <body>
            $cleanBody
              <script>
            $jsCode
              </script>
            </body>
            </html>
        """.trimIndent()
    }

    private fun extractBodyIfFullDocument(rawHtml: String): String {
        val bodyRegex = Regex("<body[^>]*>([\\s\\S]*?)</body>", RegexOption.IGNORE_CASE)
        val match = bodyRegex.find(rawHtml)
        return match?.groupValues?.getOrNull(1)?.trim() ?: rawHtml
    }
}
