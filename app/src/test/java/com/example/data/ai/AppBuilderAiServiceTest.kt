package com.example.data.ai

import com.example.data.model.GeneratedAppBundle
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
class AppBuilderAiServiceTest {

    private val service = AppBuilderAiService()

    private val sampleExistingBundle = GeneratedAppBundle(
        projectTitle = "Savanna Market",
        description = "Kenyan market with manual M-Pesa payment",
        summary = "Initial build.",
        htmlCode = "<main><h1>Savanna Market</h1></main>",
        cssCode = "body { font-size: 16px; }",
        jsCode = "console.log('ready');",
        changedFiles = listOf("index.html", "styles.css", "app.js"),
        followUpSuggestions = listOf("Add delivery zones"),
    )

    @Test
    fun parseResponse_parsesTaggedFormatWithFencedBlocks() {
        val raw = """
            <<<TITLE>>>
            Nairobi Coffee Bar
            <<<DESCRIPTION>>>
            Specialty coffee ordering app with manual M-Pesa Till payment.
            <<<SUMMARY>>>
            Built a responsive Nairobi Coffee Bar menu with manual M-Pesa Till checkout.
            <<<HTML>>>
            ```html
            <body>
            <main><h1>Nairobi Coffee Bar</h1><button id="orderBtn">Order Now</button></main>
            </body>
            ```
            <<<CSS>>>
            ```css
            :root { --accent: #b45309; }
            button { min-height: 44px; }
            ```
            <<<JS>>>
            ```javascript
            document.getElementById('orderBtn').addEventListener('click', () => {});
            ```
            <<<SUGGESTIONS>>>
            Add cold brew menu | Add Till QR card | Increase card spacing
        """.trimIndent()

        val result = service.parseResponse(raw, existingBundleFallback = null)
        assertTrue(result.isSuccess)
        val bundle = result.getOrThrow()
        assertEquals("Nairobi Coffee Bar", bundle.projectTitle)
        assertTrue(bundle.summary.contains("manual M-Pesa Till"))
        assertTrue(bundle.htmlCode.startsWith("<main>"))
        assertTrue(!bundle.htmlCode.contains("<body>"))
        assertTrue(bundle.cssCode.contains("--accent: #b45309"))
        assertTrue(bundle.jsCode.contains("addEventListener"))
        assertEquals(3, bundle.followUpSuggestions.size)
        assertEquals(listOf("index.html", "styles.css", "app.js"), bundle.changedFiles)
    }

    @Test
    fun parseResponse_supportsConversationalReplyWhenExistingBundlePresent() {
        val raw = "I kept your existing Till number 5482910 intact. You can tap Edit on the Code tab anytime to customize it."
        val result = service.parseResponse(raw, existingBundleFallback = sampleExistingBundle)
        assertTrue(result.isSuccess)
        val bundle = result.getOrThrow()
        assertEquals(sampleExistingBundle.htmlCode, bundle.htmlCode)
        assertEquals(sampleExistingBundle.cssCode, bundle.cssCode)
        assertEquals(sampleExistingBundle.jsCode, bundle.jsCode)
        assertTrue(bundle.changedFiles.isEmpty())
        assertTrue(bundle.summary.contains("5482910"))
    }

    @Test
    fun parseResponse_fallsBackToJsonBundle() {
        val raw = """
            ```json
            {
              "projectTitle": "Bistro Bloom",
              "description": "Artisanal bistro booking app",
              "summary": "Created Bistro Bloom with interactive table reservation.",
              "htmlCode": "<section><h1>Bistro Bloom</h1></section>",
              "cssCode": "section { padding: 16px; }",
              "jsCode": "console.log('init');",
              "changedFiles": ["index.html", "styles.css", "app.js"],
              "followUpSuggestions": ["Add chef specials", "Add wine list", "Add hours footer"]
            }
            ```
        """.trimIndent()

        val result = service.parseResponse(raw, existingBundleFallback = null)
        assertTrue(result.isSuccess)
        val bundle = result.getOrThrow()
        assertEquals("Bistro Bloom", bundle.projectTitle)
        assertTrue(bundle.htmlCode.contains("Bistro Bloom"))
        assertEquals(3, bundle.followUpSuggestions.size)
    }

    @Test
    fun parseResponse_extractsRawHtmlDocumentFallback() {
        val raw = """
            <!doctype html>
            <html>
            <head><style>body { color: #111; }</style></head>
            <body>
            <main><h1>Quick Utility</h1></main>
            <script>console.log('ok');</script>
            </body>
            </html>
        """.trimIndent()

        val result = service.parseResponse(raw, existingBundleFallback = null)
        assertTrue(result.isSuccess)
        val bundle = result.getOrThrow()
        assertEquals("<main><h1>Quick Utility</h1></main>", bundle.htmlCode)
        assertEquals("body { color: #111; }", bundle.cssCode)
        assertEquals("console.log('ok');", bundle.jsCode)
    }
}
