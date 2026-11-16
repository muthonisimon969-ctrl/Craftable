package com.example.data.ai

import android.util.Log
import com.example.data.model.AppProject
import com.example.data.model.GeneratedAppBundle
import com.example.data.model.ProjectMessage
import com.example.data.model.TemplateType
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.GenerativeBackend
import com.google.firebase.ai.type.content
import com.google.firebase.ai.type.generationConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.withTimeout
import org.json.JSONObject
import java.util.Locale

class AppBuilderAiService {

    private val systemPrompt = """
        You are Craft AI, a principal product designer and senior front-end engineer inside Craftable.

        RULE #0 — STRICTLY OBEY THE USER'S PROMPT:
        - Build or edit EXACTLY what the user asks for: their exact app concept, business name, pages, sections, controls, colors, and workflows.
        - NEVER ignore the user's request or substitute a generic or unrelated app.

        1. MANUAL PAYMENTS & KENYAN CONTEXT:
        - Unless the user explicitly asks for Safaricom Daraja API integration, ALWAYS implement MANUAL M-Pesa payments when checkout/payment is needed: show Buy Goods Till / Paybill + Account number with a Copy button, KSh total, customer phone (+254 / 07XX) and M-Pesa Confirmation Code input, plus an owner verification view ("Pending Verification" -> "Confirm Payment"). Never fake automatic STK Push when manual payments are requested.
        - Only include Kenyan cues (KSh, +254, M-Pesa) when relevant to a Kenyan/East African request or asked by the user.

        2. DESIGN & ENGINEERING QUALITY:
        - Crisp, spacious mobile-first UI: :root CSS custom properties (--bg, --surface, --ink, --muted, --accent, --border), intentional typography pairing, 16px+ readable body text, large clickable buttons (min-height: 44px), and fluid widths (max-width, never fixed widths > 900px).
        - Self-contained: NO external http(s) <img> URLs or CDN scripts; use crisp inline SVGs. Wire all buttons, forms, tabs, modals, and localStorage state with real vanilla JS event listeners. Never use alert(), confirm(), or prompt().
        - HTML section must contain ONLY inner <body> markup (no <!DOCTYPE>, <html>, <head>, <body>, <style>, or <script> tags).

        3. REQUIRED OUTPUT FORMAT (use these exact section markers so code streams fast):
        <<<TITLE>>>
        2 to 4 word project title
        <<<DESCRIPTION>>>
        One concise sentence describing the app
        <<<SUMMARY>>>
        Friendly 2-sentence explanation of what you built, changed, or answered for the user
        <<<HTML>>>
        Inner <body> HTML markup
        <<<CSS>>>
        Complete CSS stylesheet
        <<<JS>>>
        Complete vanilla JavaScript
        <<<SUGGESTIONS>>>
        Suggestion 1 | Suggestion 2 | Suggestion 3
    """.trimIndent()

    private val primaryModel by lazy {
        Firebase.ai(backend = GenerativeBackend.googleAI()).generativeModel(
            modelName = "gemini-3.8-flash",
            generationConfig = generationConfig {
                temperature = 0.45f
            },
            systemInstruction = content {
                text(systemPrompt)
            },
        )
    }

    private val fallbackModel by lazy {
        Firebase.ai(backend = GenerativeBackend.googleAI()).generativeModel(
            modelName = "gemini-3.5-flash-lite",
            generationConfig = generationConfig {
                temperature = 0.45f
            },
            systemInstruction = content {
                text(systemPrompt)
            },
        )
    }

    suspend fun generateNewApp(
        prompt: String,
        templateType: TemplateType,
        onStageUpdate: (String) -> Unit = {},
    ): Result<GeneratedAppBundle> {
        val fullPrompt = buildString {
            appendLine("BUILD EXACTLY THIS APP:")
            appendLine("\"$prompt\"")
            appendLine()
            appendLine("Category hint: ${templateType.displayName} (follow the user's prompt 100%).")
            appendLine("Output all sections using <<<TITLE>>>, <<<DESCRIPTION>>>, <<<SUMMARY>>>, <<<HTML>>>, <<<CSS>>>, <<<JS>>>, and <<<SUGGESTIONS>>>.")
        }
        return executeWithStreamAndFallback(
            userRequest = prompt,
            promptText = fullPrompt,
            existingBundleFallback = null,
            onStageUpdate = onStageUpdate,
        )
    }

    suspend fun iterateExistingApp(
        project: AppProject,
        userPrompt: String,
        recentMessages: List<ProjectMessage> = emptyList(),
        activeHtml: String = project.htmlCode,
        activeCss: String = project.cssCode,
        activeJs: String = project.jsCode,
        onStageUpdate: (String) -> Unit = {},
    ): Result<GeneratedAppBundle> {
        val historyTail = recentMessages.takeLast(6)
        val fullPrompt = buildString {
            appendLine("EXISTING PROJECT: \"${project.title}\" (v${project.version})")
            appendLine("Original prompt: ${project.initialPrompt}")
            if (historyTail.isNotEmpty()) {
                appendLine()
                appendLine("Recent conversation:")
                historyTail.forEach { msg ->
                    val speaker = if (msg.role == ProjectMessage.ROLE_USER) "USER" else "ASSISTANT"
                    appendLine("- $speaker: ${msg.content.take(260)}")
                }
            }
            appendLine()
            appendLine("USER REQUEST NOW:")
            appendLine("\"$userPrompt\"")
            appendLine()
            appendLine("If the user is asking for edits or new features, apply them faithfully and output updated <<<TITLE>>>, <<<DESCRIPTION>>>, <<<SUMMARY>>>, <<<HTML>>>, <<<CSS>>>, <<<JS>>>, <<<SUGGESTIONS>>>.")
            appendLine("If the user is only asking a question or greeting without requesting code changes, answer clearly in <<<SUMMARY>>>.")
            appendLine()
            appendLine("Current HTML:")
            appendLine(activeHtml.take(12_000))
            appendLine()
            appendLine("Current CSS:")
            appendLine(activeCss.take(9_000))
            appendLine()
            appendLine("Current JS:")
            appendLine(activeJs.take(12_000))
        }
        val existingBundle = GeneratedAppBundle(
            projectTitle = project.title,
            description = project.description,
            summary = "",
            htmlCode = activeHtml,
            cssCode = activeCss,
            jsCode = activeJs,
            changedFiles = emptyList(),
            followUpSuggestions = listOf(
                "Add manual M-Pesa Till checkout",
                "Make buttons & text larger",
                "Refine layout & visual polish",
            ),
        )
        return executeWithStreamAndFallback(
            userRequest = "${project.initialPrompt}\n$userPrompt",
            promptText = fullPrompt,
            existingBundleFallback = existingBundle,
            onStageUpdate = onStageUpdate,
        )
    }

    private suspend fun executeWithStreamAndFallback(
        userRequest: String,
        promptText: String,
        existingBundleFallback: GeneratedAppBundle?,
        onStageUpdate: (String) -> Unit,
    ): Result<GeneratedAppBundle> {
        onStageUpdate("Connecting to Craft AI...")

        // Attempt 1: Stream with primary model (gemini-3.8-flash)
        val primaryAttempt = runCatchingStreamOrUnary(
            model = primaryModel,
            promptText = promptText,
            existingBundleFallback = existingBundleFallback,
            onStageUpdate = onStageUpdate,
        )

        primaryAttempt.onSuccess { bundle ->
            return finalizeBundle(userRequest, bundle, existingBundleFallback, onStageUpdate)
        }

        val primaryErr = primaryAttempt.exceptionOrNull()
        if (primaryErr is CancellationException && primaryErr !is TimeoutCancellationException) {
            throw primaryErr
        }

        // If App Check 403 or obvious offline network error, fail fast with actionable message
        if (isHardEnvironmentError(primaryErr)) {
            val readable = formatReadableAiError(primaryErr)
            Log.e(TAG, "Primary Craft AI call failed with hard environment error: $readable", primaryErr)
            return Result.failure(IllegalStateException(readable, primaryErr))
        }

        // Attempt 2: Fast fallback model (gemini-3.5-flash-lite)
        Log.w(TAG, "Primary model failed (${primaryErr?.message}), switching to fallback model", primaryErr)
        onStageUpdate("Switching to fast Craft AI engine...")

        val fallbackAttempt = runCatchingStreamOrUnary(
            model = fallbackModel,
            promptText = promptText,
            existingBundleFallback = existingBundleFallback,
            onStageUpdate = onStageUpdate,
        )

        fallbackAttempt.onSuccess { bundle ->
            return finalizeBundle(userRequest, bundle, existingBundleFallback, onStageUpdate)
        }

        val finalErr = fallbackAttempt.exceptionOrNull() ?: primaryErr
        if (finalErr is CancellationException && finalErr !is TimeoutCancellationException) {
            throw finalErr
        }
        val readable = formatReadableAiError(finalErr)
        Log.e(TAG, "Both primary and fallback Craft AI calls failed: $readable", finalErr)
        return Result.failure(IllegalStateException(readable, finalErr))
    }

    private suspend fun runCatchingStreamOrUnary(
        model: com.google.firebase.ai.GenerativeModel,
        promptText: String,
        existingBundleFallback: GeneratedAppBundle?,
        onStageUpdate: (String) -> Unit,
    ): Result<GeneratedAppBundle> {
        val rawBuilder = StringBuilder()
        var streamError: Throwable? = null

        try {
            withTimeout(STREAM_TIMEOUT_MS) {
                model.generateContentStream(promptText).collect { chunk ->
                    val piece = chunk.text.orEmpty()
                    if (piece.isNotEmpty()) {
                        rawBuilder.append(piece)
                        val kb = rawBuilder.length / 1024.0
                        onStageUpdate(
                            if (kb >= 0.8) {
                                "Craft AI is writing code... (${String.format(Locale.US, "%.1f", kb)} KB)"
                            } else {
                                "Craft AI is replying..."
                            }
                        )
                    }
                }
            }
        } catch (e: TimeoutCancellationException) {
            streamError = e
        } catch (e: CancellationException) {
            throw e
        } catch (e: Throwable) {
            streamError = e
        }

        val streamedText = rawBuilder.toString().trim()
        if (streamedText.isNotBlank()) {
            val parsed = parseResponse(streamedText, existingBundleFallback)
            if (parsed.isSuccess) return parsed
        }

        if (isHardEnvironmentError(streamError)) {
            return Result.failure(streamError ?: IllegalStateException("Craft AI request blocked."))
        }

        // If primary stream timed out with zero tokens, jump directly to ultra-fast fallbackModel
        if (streamError is TimeoutCancellationException && streamedText.isBlank()) {
            return Result.failure(streamError)
        }

        // Unary fallback on the same model if stream had a non-timeout error or partial unparseable text
        return try {
            onStageUpdate("Completing Craft AI response...")
            val unary = withTimeout(UNARY_TIMEOUT_MS) {
                model.generateContent(promptText)
            }
            val unaryText = unary.text.orEmpty().trim()
            if (unaryText.isBlank()) {
                Result.failure(
                    streamError ?: IllegalStateException("Craft AI returned an empty response. Please tap Retry.")
                )
            } else {
                parseResponse(unaryText, existingBundleFallback)
            }
        } catch (e: CancellationException) {
            if (e is TimeoutCancellationException) {
                Result.failure(e)
            } else {
                throw e
            }
        } catch (e: Throwable) {
            Result.failure(e)
        }
    }

    private fun finalizeBundle(
        userRequest: String,
        bundle: GeneratedAppBundle,
        existingBundleFallback: GeneratedAppBundle?,
        onStageUpdate: (String) -> Unit,
    ): Result<GeneratedAppBundle> {
        val didUpdateCode = existingBundleFallback == null ||
            bundle.htmlCode != existingBundleFallback.htmlCode ||
            bundle.cssCode != existingBundleFallback.cssCode ||
            bundle.jsCode != existingBundleFallback.jsCode

        if (!didUpdateCode) {
            return Result.success(bundle.copy(changedFiles = emptyList()))
        }

        onStageUpdate("Checking code quality...")
        val audit = WebQualityValidator.audit(
            prompt = userRequest,
            htmlCode = bundle.htmlCode,
            cssCode = bundle.cssCode,
            jsCode = bundle.jsCode,
        )
        val qaText = audit.toConciseSummary()
        val fullSummary = buildString {
            append(bundle.summary.trim())
            if (isNotEmpty()) append("\n\n")
            append(qaText)
        }
        return Result.success(
            bundle.copy(
                summary = fullSummary,
                qaSummary = qaText,
            )
        )
    }

    internal fun parseResponse(
        rawText: String,
        existingBundleFallback: GeneratedAppBundle?,
    ): Result<GeneratedAppBundle> {
        val cleaned = rawText.trim()

        // 1. Try tagged format first
        if (cleaned.contains("<<<SUMMARY>>>", ignoreCase = true) ||
            cleaned.contains("<<<HTML>>>", ignoreCase = true) ||
            cleaned.contains("<<<TITLE>>>", ignoreCase = true)
        ) {
            val title = extractTag(cleaned, "TITLE")
                .ifBlank { existingBundleFallback?.projectTitle ?: "Crafted App" }
            val description = extractTag(cleaned, "DESCRIPTION")
                .ifBlank { existingBundleFallback?.description ?: "Interactive web app crafted by Craft AI" }
            val summary = extractTag(cleaned, "SUMMARY")
                .ifBlank { "Updated your application as requested." }
            val parsedHtml = stripCodeFence(extractTag(cleaned, "HTML"))
            val parsedCss = stripCodeFence(extractTag(cleaned, "CSS"))
            val parsedJs = stripCodeFence(extractTag(cleaned, "JS"))
            val suggestionsRaw = extractTag(cleaned, "SUGGESTIONS")
            val suggestions = suggestionsRaw
                .split("|", "\n")
                .map { it.trim().removePrefix("-").removePrefix("*").trim() }
                .filter { it.isNotBlank() }
                .take(3)
                .ifEmpty {
                    listOf("Add manual M-Pesa Till payment", "Make buttons & text larger", "Refine layout & polish")
                }

            val finalHtml = stripBodyWrapperIfPresent(parsedHtml)
                .ifBlank { existingBundleFallback?.htmlCode.orEmpty() }
            val finalCss = parsedCss.ifBlank { existingBundleFallback?.cssCode.orEmpty() }
            val finalJs = parsedJs.ifBlank { existingBundleFallback?.jsCode.orEmpty() }

            if (finalHtml.isNotBlank()) {
                val changed = buildList {
                    if (parsedHtml.isNotBlank()) add("index.html")
                    if (parsedCss.isNotBlank()) add("styles.css")
                    if (parsedJs.isNotBlank()) add("app.js")
                }
                return Result.success(
                    GeneratedAppBundle(
                        projectTitle = title.take(80),
                        description = description.take(300),
                        summary = summary,
                        htmlCode = finalHtml,
                        cssCode = finalCss,
                        jsCode = finalJs,
                        changedFiles = changed,
                        followUpSuggestions = suggestions,
                    )
                )
            }
        }

        // 2. Fallback: JSON object if model replied with JSON (must begin with '{' after code fence stripping)
        val strippedForJson = stripCodeFence(cleaned)
        if (strippedForJson.trimStart().startsWith("{") && strippedForJson.trimEnd().endsWith("}")) {
            val jsonParsed = parseBundleJson(strippedForJson, existingBundleFallback)
            if (jsonParsed.isSuccess) return jsonParsed
        }

        // 3. Fallback: Full HTML document directly
        if (cleaned.contains("<html", ignoreCase = true) ||
            cleaned.contains("<body", ignoreCase = true) ||
            cleaned.contains("<section", ignoreCase = true) ||
            cleaned.contains("<main", ignoreCase = true)
        ) {
            val cleanedHtml = stripCodeFence(cleaned)
            val extractedStyle = Regex("<style[^>]*>([\\s\\S]*?)</style>", RegexOption.IGNORE_CASE)
                .find(cleanedHtml)?.groupValues?.getOrNull(1)?.trim().orEmpty()
            val extractedScript = Regex("<script[^>]*>([\\s\\S]*?)</script>", RegexOption.IGNORE_CASE)
                .find(cleanedHtml)?.groupValues?.getOrNull(1)?.trim().orEmpty()
            val bodyOnly = stripBodyWrapperIfPresent(
                cleanedHtml
                    .replace(Regex("<style[^>]*>[\\s\\S]*?</style>", RegexOption.IGNORE_CASE), "")
                    .replace(Regex("<script[^>]*>[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
            )
            if (bodyOnly.isNotBlank()) {
                return Result.success(
                    GeneratedAppBundle(
                        projectTitle = existingBundleFallback?.projectTitle ?: "Crafted App",
                        description = existingBundleFallback?.description ?: "Interactive web application",
                        summary = "Built your application from your prompt.",
                        htmlCode = bodyOnly,
                        cssCode = extractedStyle.ifBlank { existingBundleFallback?.cssCode.orEmpty() },
                        jsCode = extractedScript.ifBlank { existingBundleFallback?.jsCode.orEmpty() },
                        changedFiles = listOf("index.html", "styles.css", "app.js"),
                        followUpSuggestions = listOf("Add manual M-Pesa Till payment", "Make buttons & text larger", "Refine layout & polish"),
                    )
                )
            }
        }

        // 4. Conversational plain-text reply during Workspace iteration (never fail if existing code exists!)
        if (existingBundleFallback != null && cleaned.isNotBlank()) {
            return Result.success(
                existingBundleFallback.copy(
                    summary = cleaned.take(1500),
                    changedFiles = emptyList(),
                )
            )
        }

        return Result.failure(
            IllegalStateException("Craft AI response was incomplete. Please tap Retry.")
        )
    }

    private fun parseBundleJson(
        rawText: String,
        existingBundleFallback: GeneratedAppBundle?,
    ): Result<GeneratedAppBundle> {
        val trimmed = stripCodeFence(rawText)
        val start = trimmed.indexOf('{')
        val end = trimmed.lastIndexOf('}')
        val jsonText = if (start >= 0 && end > start) trimmed.substring(start, end + 1) else trimmed

        val json = try {
            JSONObject(jsonText)
        } catch (e: Exception) {
            return Result.failure(IllegalStateException("Could not parse Craft AI JSON output.", e))
        }

        val title = json.optString("projectTitle", existingBundleFallback?.projectTitle ?: "Crafted App")
            .ifBlank { existingBundleFallback?.projectTitle ?: "Crafted App" }
        val description = json.optString("description", existingBundleFallback?.description ?: "Interactive web app")
        val summary = json.optString("summary", "Crafted your interactive web application.")
        val htmlCode = stripBodyWrapperIfPresent(json.optString("htmlCode", ""))
            .ifBlank { existingBundleFallback?.htmlCode.orEmpty() }
        val cssCode = json.optString("cssCode", "")
            .ifBlank { existingBundleFallback?.cssCode.orEmpty() }
        val jsCode = json.optString("jsCode", "")
            .ifBlank { existingBundleFallback?.jsCode.orEmpty() }

        if (htmlCode.isBlank()) {
            return Result.failure(IllegalStateException("Craft AI returned empty HTML output. Please tap Retry."))
        }

        val changedFilesArray = json.optJSONArray("changedFiles")
        val changedFiles = if (changedFilesArray != null) {
            (0 until changedFilesArray.length()).mapNotNull { idx ->
                changedFilesArray.optString(idx).takeIf { it.isNotBlank() }
            }
        } else {
            listOf("index.html", "styles.css", "app.js")
        }

        val suggestionsArray = json.optJSONArray("followUpSuggestions")
        val suggestions = if (suggestionsArray != null) {
            (0 until suggestionsArray.length()).mapNotNull { idx ->
                suggestionsArray.optString(idx).takeIf { it.isNotBlank() }
            }
        } else {
            emptyList()
        }.ifEmpty {
            listOf("Add manual M-Pesa Till payment", "Make buttons & text larger", "Refine layout & polish")
        }

        return Result.success(
            GeneratedAppBundle(
                projectTitle = title,
                description = description,
                summary = summary,
                htmlCode = htmlCode,
                cssCode = cssCode,
                jsCode = jsCode,
                changedFiles = changedFiles,
                followUpSuggestions = suggestions.take(3),
            )
        )
    }

    private fun extractTag(text: String, tagName: String): String {
        val pattern = Regex(
            "<<<$tagName>>>([\\s\\S]*?)(?=<<<(?:TITLE|DESCRIPTION|SUMMARY|HTML|CSS|JS|SUGGESTIONS)>>>|$)",
            RegexOption.IGNORE_CASE,
        )
        return pattern.find(text)?.groupValues?.getOrNull(1)?.trim().orEmpty()
    }

    private fun stripCodeFence(raw: String): String {
        var text = raw.trim()
        if (text.startsWith("```")) {
            val firstNewline = text.indexOf('\n')
            if (firstNewline > 0) {
                text = text.substring(firstNewline + 1)
            }
        }
        if (text.endsWith("```")) {
            text = text.removeSuffix("```")
        }
        return text.trim()
    }

    private fun stripBodyWrapperIfPresent(rawHtml: String): String {
        val bodyRegex = Regex("<body[^>]*>([\\s\\S]*?)</body>", RegexOption.IGNORE_CASE)
        return bodyRegex.find(rawHtml)?.groupValues?.getOrNull(1)?.trim() ?: rawHtml.trim()
    }

    private fun isHardEnvironmentError(error: Throwable?): Boolean {
        if (error == null) return false
        val msg = error.localizedMessage.orEmpty().lowercase()
        return msg.contains("403") ||
            msg.contains("app check") ||
            msg.contains("appcheck") ||
            msg.contains("unable to resolve host") ||
            msg.contains("failed to connect") ||
            msg.contains("network is unreachable")
    }

    private fun formatReadableAiError(error: Throwable?): String {
        if (error is TimeoutCancellationException) {
            return "Craft AI took longer than 45s to respond. Tap Retry or try a shorter prompt."
        }
        val raw = error?.localizedMessage?.takeIf { it.isNotBlank() }
            ?: error?.javaClass?.simpleName
            ?: "Unknown error"
        val lower = raw.lowercase()
        return when {
            lower.contains("app check") || lower.contains("appcheck") || lower.contains("403") ->
                "Craft AI attestation failed ($raw). Please reopen the app from AI Studio or check network access."
            lower.contains("unable to resolve host") || lower.contains("connect") || lower.contains("network") ->
                "Cannot reach Craft AI servers ($raw). Check emulator internet and tap Retry."
            else -> "Craft AI error: $raw"
        }
    }

    private companion object {
        const val TAG = "AppBuilderAiService"
        const val STREAM_TIMEOUT_MS = 45_000L
        const val UNARY_TIMEOUT_MS = 45_000L
    }
}
