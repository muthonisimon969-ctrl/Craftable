package com.example.data.ai

data class QualityCheckItem(
    val id: String,
    val label: String,
    val passed: Boolean,
    val detail: String,
)

data class QualityAuditReport(
    val checks: List<QualityCheckItem>,
) {
    val passedCount: Int get() = checks.count { it.passed }
    val totalCount: Int get() = checks.size
    val failedChecks: List<QualityCheckItem> get() = checks.filter { !it.passed }
    val allPassed: Boolean get() = failedChecks.isEmpty()

    fun toConciseSummary(): String = buildString {
        append("QA Audit ($passedCount/$totalCount checks passed)")
        if (failedChecks.isNotEmpty()) {
            append(": needs attention on ")
            append(failedChecks.joinToString("; ") { it.label })
        } else {
            append(": structure, typography, responsive CSS, self-contained assets, JS syntax, and market context verified.")
        }
    }
}

object WebQualityValidator {

    private val kenyanPromptKeywords = listOf(
        "kenya", "kenyan", "nairobi", "mombasa", "kisumu", "nakuru", "eldoret",
        "m-pesa", "mpesa", "ksh", "kes", "safaricom", "+254", "east africa",
    )

    private val externalBrokenImgRegex = Regex(
        """<img\b[^>]*\bsrc\s*=\s*["']https?://[^"']+["']""",
        RegexOption.IGNORE_CASE,
    )

    private val placeholderTextRegex = Regex(
        """\b(lorem ipsum|dolor sit amet|coming soon placeholder|todo:)\b""",
        RegexOption.IGNORE_CASE,
    )

    private val fixedHugeWidthRegex = Regex(
        """(?<![a-z-])width\s*:\s*(9\d{2}|[1-9]\d{3,})px\b""",
        RegexOption.IGNORE_CASE,
    )

    fun audit(
        prompt: String,
        htmlCode: String,
        cssCode: String,
        jsCode: String,
    ): QualityAuditReport {
        val checks = mutableListOf<QualityCheckItem>()

        // 1. Structural completeness (nav/header, main/section, heading, footer/controls)
        val hasHeading = Regex("""<h[12]\b""", RegexOption.IGNORE_CASE).containsMatchIn(htmlCode)
        val hasNavOrHeader = Regex("""<(header|nav)\b""", RegexOption.IGNORE_CASE).containsMatchIn(htmlCode)
        val hasSectionOrMain = Regex("""<(main|section|article)\b""", RegexOption.IGNORE_CASE).containsMatchIn(htmlCode)
        val hasInteractiveMarkup = Regex("""<(button|a|input|select|form)\b""", RegexOption.IGNORE_CASE).containsMatchIn(htmlCode)
        val hasLeakWrapper = Regex("""<\s*(?:!DOCTYPE|html|head|body)\b""", RegexOption.IGNORE_CASE).containsMatchIn(htmlCode)
        val structureOk = hasHeading && hasNavOrHeader && hasSectionOrMain && hasInteractiveMarkup && !hasLeakWrapper && htmlCode.length >= 250
        checks += QualityCheckItem(
            id = "structure",
            label = "Semantic structure & completeness",
            passed = structureOk,
            detail = buildString {
                if (structureOk) append("Semantic header/nav, sections, headings, and interactive elements present.")
                else {
                    val missing = mutableListOf<String>()
                    if (!hasHeading) missing += "h1/h2 heading"
                    if (!hasNavOrHeader) missing += "header/nav"
                    if (!hasSectionOrMain) missing += "main/section"
                    if (!hasInteractiveMarkup) missing += "interactive controls"
                    if (hasLeakWrapper) missing += "strip html/head/body wrapper tags"
                    if (htmlCode.length < 250) missing += "too sparse"
                    append("Issues: ${missing.joinToString(", ")}")
                }
            },
        )

        // 2. Design system & typography intentionality
        val hasCssVars = cssCode.contains("--")
        val hasFontRule = cssCode.contains("font-family", ignoreCase = true)
        val hasScaleHierarchy = cssCode.contains("clamp(", ignoreCase = true) ||
            cssCode.contains("rem", ignoreCase = true) ||
            Regex("""font-size\s*:""").findAll(cssCode).count() >= 3
        val typographyOk = hasCssVars && hasFontRule && hasScaleHierarchy && cssCode.length >= 300
        checks += QualityCheckItem(
            id = "typography_tokens",
            label = "Typography & color token system",
            passed = typographyOk,
            detail = if (typographyOk) {
                "CSS custom properties, intentional font-family, and typographic scale found."
            } else {
                "Missing CSS custom properties (--tokens), font-family pairing, or clear typographic hierarchy."
            },
        )

        // 3. Mobile & responsive layout
        val hasMediaOrFluidGrid = cssCode.contains("@media", ignoreCase = true) ||
            cssCode.contains("auto-fit", ignoreCase = true) ||
            cssCode.contains("auto-fill", ignoreCase = true) ||
            cssCode.contains("clamp(", ignoreCase = true)
        val hasHugeFixedWidth = fixedHugeWidthRegex.containsMatchIn(cssCode)
        val responsiveOk = hasMediaOrFluidGrid && !hasHugeFixedWidth
        checks += QualityCheckItem(
            id = "responsive_layout",
            label = "Mobile & responsive layout",
            passed = responsiveOk,
            detail = if (responsiveOk) {
                "Responsive breakpoints / fluid grid present without fixed desktop-only widths."
            } else if (hasHugeFixedWidth) {
                "Detected fixed wide pixel width (>900px) that can break mobile viewports."
            } else {
                "Missing @media queries or fluid CSS Grid/Flexbox rules for mobile responsiveness."
            },
        )

        // 4. Self-contained imagery & authentic copy (no external broken URLs or Lorem Ipsum)
        val hasExternalImages = externalBrokenImgRegex.containsMatchIn(htmlCode)
        val hasPlaceholderCopy = placeholderTextRegex.containsMatchIn(htmlCode)
        val assetsOk = !hasExternalImages && !hasPlaceholderCopy
        checks += QualityCheckItem(
            id = "assets_and_copy",
            label = "Self-contained visuals & authentic copy",
            passed = assetsOk,
            detail = when {
                hasExternalImages -> "Contains external http(s) <img> URLs that may fail offline; replace with crisp inline SVGs."
                hasPlaceholderCopy -> "Contains placeholder/Lorem Ipsum copy; replace with domain-authentic copy."
                else -> "Uses self-contained visuals and realistic domain copy."
            },
        )

        // 5. JavaScript interactivity & balanced syntax
        val hasJsListeners = jsCode.contains("addEventListener", ignoreCase = true) ||
            jsCode.contains("onclick", ignoreCase = true) ||
            htmlCode.contains("onclick=", ignoreCase = true)
        val usesBrowserDialogStubs = Regex("""\b(alert|confirm|prompt)\s*\(""").containsMatchIn(jsCode)
        val balancedSyntax = hasBalancedDelimiters(jsCode)
        val jsOk = jsCode.isNotBlank() && hasJsListeners && balancedSyntax && !usesBrowserDialogStubs
        checks += QualityCheckItem(
            id = "interactivity_js",
            label = "Functional JS & syntax integrity",
            passed = jsOk,
            detail = when {
                !balancedSyntax -> "Unbalanced braces, brackets, or parentheses detected in app.js."
                usesBrowserDialogStubs -> "Avoid native alert()/confirm()/prompt(); render in-page modals or toast feedback."
                !hasJsListeners -> "No interactive event listeners found in app.js."
                else -> "Balanced JavaScript syntax with active event listeners and clean UI feedback."
            },
        )

        // 6. Industry, manual-payment preference & Kenyan context alignment
        val lowerPrompt = prompt.lowercase()
        val expectsKenyan = kenyanPromptKeywords.any { lowerPrompt.contains(it) } ||
            lowerPrompt.contains("till") ||
            lowerPrompt.contains("paybill")
        val prefersManualPayment = lowerPrompt.contains("manual payment") ||
            lowerPrompt.contains("manual m-pesa") ||
            lowerPrompt.contains("manual mpesa") ||
            lowerPrompt.contains("no daraja") ||
            lowerPrompt.contains("without daraja") ||
            lowerPrompt.contains("don't have") && lowerPrompt.contains("daraja")
        val combinedOutput = (htmlCode + "\n" + jsCode).lowercase()
        val hasKenyanSignals = combinedOutput.contains("ksh") ||
            combinedOutput.contains("+254") ||
            combinedOutput.contains("m-pesa") ||
            combinedOutput.contains("mpesa") ||
            combinedOutput.contains("till") ||
            combinedOutput.contains("paybill") ||
            combinedOutput.contains("nairobi")
        val claimsAutomaticDaraja = combinedOutput.contains("stk push") ||
            combinedOutput.contains("daraja api") ||
            combinedOutput.contains("lipa na m-pesa online")
        val contextOk = when {
            prefersManualPayment && claimsAutomaticDaraja -> false
            expectsKenyan -> hasKenyanSignals
            else -> !combinedOutput.contains("m-pesa") && !combinedOutput.contains("+254")
        }
        checks += QualityCheckItem(
            id = "market_context",
            label = "Industry & market relevance",
            passed = contextOk,
            detail = when {
                prefersManualPayment && claimsAutomaticDaraja ->
                    "User requested manual payments without Safaricom Daraja, but output mentions automatic STK Push / Daraja API."
                contextOk && expectsKenyan ->
                    "Kenyan context (KSh / +254 / manual M-Pesa Till or Paybill) applied naturally."
                contextOk ->
                    "Market context matches the requested audience without unrelated localization."
                expectsKenyan ->
                    "Prompt implies Kenyan business context but output lacks local cues (KSh, +254, Till/Paybill)."
                else ->
                    "Unrequested Kenyan-specific payment/phone details injected into a non-Kenyan project."
            },
        )

        return QualityAuditReport(checks = checks)
    }

    internal fun hasBalancedDelimiters(code: String): Boolean {
        var inSingleQuote = false
        var inDoubleQuote = false
        var inTemplate = false
        var inLineComment = false
        var inBlockComment = false
        var prevChar = '\u0000'
        val stack = ArrayDeque<Char>()

        var i = 0
        while (i < code.length) {
            val c = code[i]
            val next = if (i + 1 < code.length) code[i + 1] else '\u0000'

            if (inLineComment) {
                if (c == '\n') inLineComment = false
                prevChar = c
                i++
                continue
            }
            if (inBlockComment) {
                if (c == '*' && next == '/') {
                    inBlockComment = false
                    i += 2
                    prevChar = '/'
                    continue
                }
                prevChar = c
                i++
                continue
            }

            if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
                if (c == '/' && next == '/') {
                    inLineComment = true
                    i += 2
                    prevChar = '/'
                    continue
                }
                if (c == '/' && next == '*') {
                    inBlockComment = true
                    i += 2
                    prevChar = '*'
                    continue
                }
            }

            val escaped = prevChar == '\\'
            if (!escaped) {
                when (c) {
                    '\'' -> if (!inDoubleQuote && !inTemplate) inSingleQuote = !inSingleQuote
                    '"' -> if (!inSingleQuote && !inTemplate) inDoubleQuote = !inDoubleQuote
                    '`' -> if (!inSingleQuote && !inDoubleQuote) inTemplate = !inTemplate
                }
            }

            if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
                when (c) {
                    '{', '(', '[' -> stack.addLast(c)
                    '}' -> if (stack.removeLastOrNull() != '{') return false
                    ')' -> if (stack.removeLastOrNull() != '(') return false
                    ']' -> if (stack.removeLastOrNull() != '[') return false
                }
            }

            prevChar = if (escaped && c == '\\') '\u0000' else c
            i++
        }

        return stack.isEmpty() && !inSingleQuote && !inDoubleQuote && !inTemplate
    }
}
