package com.example.data.ai

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class WebQualityValidatorTest {

    private val validHtml = """
        <header class="site-header">
          <nav class="nav">
            <a href="#work" class="brand">Atelier</a>
            <button id="menuBtn" type="button">Menu</button>
          </nav>
        </header>
        <main>
          <section class="hero">
            <h1>Quietly Tailored Essentials</h1>
            <p>Crafted in small seasonal runs with organic linen and raw silk.</p>
            <button id="reserveBtn" type="button">Explore Collection</button>
          </section>
          <section id="work" class="grid">
            <article class="card"><h2>Autumn Capsule</h2></article>
          </section>
        </main>
    """.trimIndent()

    private val validCss = """
        :root {
          --bg: #faf8f5;
          --ink: #181615;
          --accent: #b8924a;
          --font-display: Georgia, serif;
          --font-body: system-ui, sans-serif;
        }
        body {
          background: var(--bg);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 1rem;
        }
        h1 {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3.25rem);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 640px) {
          .nav { padding: 12px 16px; }
        }
    """.trimIndent()

    private val validJs = """
        document.addEventListener('DOMContentLoaded', () => {
          const btn = document.getElementById('reserveBtn');
          if (btn) {
            btn.addEventListener('click', () => {
              btn.textContent = 'Viewing Capsule';
            });
          }
        });
    """.trimIndent()

    @Test
    fun audit_passesCleanResponsiveSite() {
        val report = WebQualityValidator.audit(
            prompt = "Create an editorial luxury fashion brand website",
            htmlCode = validHtml,
            cssCode = validCss,
            jsCode = validJs,
        )

        assertTrue("Expected all checks to pass, failed: ${report.failedChecks}", report.allPassed)
        assertEquals(6, report.passedCount)
        assertEquals(6, report.totalCount)
    }

    @Test
    fun audit_flagsUnbalancedJsExternalImagesAndAlerts() {
        val badHtml = validHtml + """<img src="https://example.com/photo.jpg" alt="photo" />"""
        val badJs = """
            document.getElementById('reserveBtn').addEventListener('click', () => {
              alert('clicked');
        """.trimIndent()

        val report = WebQualityValidator.audit(
            prompt = "Create a fashion portfolio",
            htmlCode = badHtml,
            cssCode = validCss,
            jsCode = badJs,
        )

        assertFalse(report.allPassed)
        val failedIds = report.failedChecks.map { it.id }.toSet()
        assertTrue(failedIds.contains("assets_and_copy"))
        assertTrue(failedIds.contains("interactivity_js"))
    }

    @Test
    fun audit_enforcesKenyanContextOnlyWhenRelevant() {
        val kenyanHtml = validHtml.replace("Essential", "Nairobi Essentials") +
            "<p>Total: KSh 3,500 — Pay seamlessly via M-Pesa (+254 712 345 678)</p>"

        val kenyanPassReport = WebQualityValidator.audit(
            prompt = "Build a Nairobi boutique store with M-Pesa checkout",
            htmlCode = kenyanHtml,
            cssCode = validCss,
            jsCode = validJs,
        )
        assertTrue(kenyanPassReport.allPassed)

        val kenyanMissingReport = WebQualityValidator.audit(
            prompt = "Build a Nairobi boutique store with M-Pesa checkout",
            htmlCode = validHtml,
            cssCode = validCss,
            jsCode = validJs,
        )
        assertFalse(kenyanMissingReport.allPassed)
        assertTrue(kenyanMissingReport.failedChecks.any { it.id == "market_context" })

        val forcedKenyanReport = WebQualityValidator.audit(
            prompt = "Build a Parisian bakery landing page",
            htmlCode = kenyanHtml,
            cssCode = validCss,
            jsCode = validJs,
        )
        assertFalse(forcedKenyanReport.allPassed)
        assertTrue(forcedKenyanReport.failedChecks.any { it.id == "market_context" })
    }

    @Test
    fun designTemplateLibrary_containsCuratedTemplatesAndSummary() {
        assertTrue(DesignTemplateLibrary.templates.size >= 6)
        assertNotNull(DesignTemplateLibrary.findById("atelier_editorial"))
        assertNotNull(DesignTemplateLibrary.findById("kenyan_commerce"))
        val summary = DesignTemplateLibrary.promptCatalogSummary()
        assertTrue(summary.contains("precision_tech"))
        assertTrue(summary.contains("culinary_bistro"))
        assertTrue(summary.contains("corporate_advisory"))
    }

    @Test
    fun starterTemplateBundles_allPassQualityAudit() {
        DesignTemplateLibrary.templates.forEach { template ->
            val bundle = StarterTemplateBundles.buildForTemplate(template.id)
            val report = WebQualityValidator.audit(
                prompt = template.starterPrompt,
                htmlCode = bundle.htmlCode,
                cssCode = bundle.cssCode,
                jsCode = bundle.jsCode,
            )
            assertTrue(
                "Template ${template.id} failed QA checks: ${report.failedChecks}",
                report.allPassed,
            )
        }
    }

    @Test
    fun audit_rejectsAutomaticDarajaWhenManualPaymentRequested() {
        val darajaHtml = validHtml + "<p>Pay via M-Pesa STK Push powered by Safaricom Daraja API in KSh 1,200.</p>"
        val report = WebQualityValidator.audit(
            prompt = "Build a Kenyan shop with manual payments because I do not have Safaricom Daraja",
            htmlCode = darajaHtml,
            cssCode = validCss,
            jsCode = validJs,
        )
        assertFalse(report.allPassed)
        assertTrue(report.failedChecks.any { it.id == "market_context" })
    }
}
