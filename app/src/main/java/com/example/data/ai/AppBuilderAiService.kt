package com.example.data.ai

import android.util.Log
import com.example.data.model.AppProject
import com.example.data.model.GeneratedAppBundle
import com.example.data.model.TemplateType
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.Schema
import com.google.firebase.ai.type.content
import com.google.firebase.ai.type.generationConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.withTimeout
import org.json.JSONObject

class AppBuilderAiService {

    private val appSchema = Schema.obj(
        properties = mapOf(
            "projectTitle" to Schema.string(
                description = "Short 2 to 4 word title for the generated web application"
            ),
            "description" to Schema.string(
                description = "Concise one-sentence description of what the application does"
            ),
            "summary" to Schema.string(
                description = "Friendly 2 to 3 sentence summary explaining what was built or updated, highlighting interactive features"
            ),
            "htmlCode" to Schema.string(
                description = "Complete semantic HTML markup for inside the <body> tag (do not include <html>, <head>, or <body> wrapper tags, nor external CDN script tags; use clean HTML5 elements and inline SVGs for icons/charts)"
            ),
            "cssCode" to Schema.string(
                description = "Complete self-contained modern CSS including CSS custom properties, responsive mobile-first layout, polished typography, smooth transitions, and rich visual design"
            ),
            "jsCode" to Schema.string(
                description = "Complete self-contained vanilla JavaScript powering all interactive features, state, DOM updates, event listeners, and sample realistic data"
            ),
            "changedFiles" to Schema.array(
                items = Schema.string(),
                description = "List of files created or modified, chosen from index.html, styles.css, app.js"
            ),
            "followUpSuggestions" to Schema.array(
                items = Schema.string(),
                description = "Exactly 3 short actionable follow-up prompt ideas (3 to 6 words each) the user can tap next"
            )
        )
    )

    private val model by lazy {
        Firebase.ai.generativeModel(
            modelName = "gemini-3.8-flash",
            generationConfig = generationConfig {
                responseMimeType = "application/json"
                responseSchema = appSchema
                temperature = 0.7f
            },
            systemInstruction = content {
                text(
                    """
                    You are Craftable, an elite AI full-stack web app builder (like Lovable).
                    You design and build extraordinary, interactive, production-quality web applications
                    from natural language prompts using clean HTML5, modern CSS3, and vanilla ES6+ JavaScript.

                    STRICT RULES FOR GENERATED CODE:
                    1. Everything MUST work 100% self-contained inside a mobile WebView without requiring external npm packages or external CDN scripts that might fail offline.
                    2. Use crisp inline SVGs for icons, avatars, illustrations, and charts! Never rely on broken external image URLs or external icon fonts.
                    3. Design with exceptional aesthetic polish: deliberate color palettes, clear visual hierarchy, generous spacing, subtle borders/glassmorphism, smooth hover/tap states, and mobile-first responsiveness (looks awesome at 375px wide and on tablets).
                    4. Make every button, tab, modal, filter, toggle, and form genuinely interactive in app.js with realistic initial seed data so the user can immediately play with the live preview.
                    5. In htmlCode, provide ONLY the inner content that belongs inside <body>...</body> (no <!DOCTYPE>, <html>, <head>, or <body> tags, and no <style> or <script> tags — put CSS in cssCode and JS in jsCode).
                    6. When iterating on an existing project, preserve working features and design tokens while cleanly implementing the user's requested changes.
                    """.trimIndent()
                )
            }
        )
    }

    suspend fun generateNewApp(
        prompt: String,
        templateType: TemplateType,
    ): Result<GeneratedAppBundle> {
        val fullPrompt = buildString {
            appendLine("Build a complete, interactive ${templateType.displayName} based on this request:")
            appendLine("\"$prompt\"")
            appendLine()
            appendLine("Template focus: ${templateType.displayName} (${templateType.wireValue}).")
            appendLine("Ensure rich interactivity, responsive mobile layout, inline SVG icons, and polished visual design.")
        }
        return executeGeneration(fullPrompt)
    }

    suspend fun iterateExistingApp(
        project: AppProject,
        userPrompt: String,
    ): Result<GeneratedAppBundle> {
        val fullPrompt = buildString {
            appendLine("Update the existing Craftable project \"${project.title}\" (v${project.version}).")
            appendLine("Original goal: ${project.initialPrompt}")
            appendLine()
            appendLine("User's new edit request:")
            appendLine("\"$userPrompt\"")
            appendLine()
            appendLine("Current index.html body:")
            appendLine(project.htmlCode.take(18_000))
            appendLine()
            appendLine("Current styles.css:")
            appendLine(project.cssCode.take(14_000))
            appendLine()
            appendLine("Current app.js:")
            appendLine(project.jsCode.take(18_000))
            appendLine()
            appendLine("Return the updated complete htmlCode, cssCode, and jsCode preserving existing quality while fulfilling the request.")
        }
        return executeGeneration(fullPrompt)
    }

    private suspend fun executeGeneration(promptText: String): Result<GeneratedAppBundle> {
        return try {
            val response = withTimeout(GENERATION_TIMEOUT_MS) {
                model.generateContent(promptText)
            }
            val jsonText = response.text
                ?: return Result.failure(IllegalStateException("Gemini returned an empty response."))

            val json = JSONObject(jsonText)
            val title = json.optString("projectTitle", "Untitled Craft").ifBlank { "Untitled Craft" }
            val description = json.optString("description", "AI-crafted interactive web application")
            val summary = json.optString("summary", "Crafted your interactive web application.")
            val htmlCode = json.optString("htmlCode", "")
            val cssCode = json.optString("cssCode", "")
            val jsCode = json.optString("jsCode", "")

            if (htmlCode.isBlank()) {
                return Result.failure(IllegalStateException("Generated HTML output was empty. Please try again."))
            }

            val changedFilesArray = json.optJSONArray("changedFiles")
            val changedFiles = if (changedFilesArray != null) {
                (0 until changedFilesArray.length()).mapNotNull { idx ->
                    changedFilesArray.optString(idx).takeIf { it.isNotBlank() }
                }
            } else {
                listOf("index.html", "styles.css", "app.js")
            }.ifEmpty { listOf("index.html", "styles.css", "app.js") }

            val suggestionsArray = json.optJSONArray("followUpSuggestions")
            val suggestions = if (suggestionsArray != null) {
                (0 until suggestionsArray.length()).mapNotNull { idx ->
                    suggestionsArray.optString(idx).takeIf { it.isNotBlank() }
                }
            } else {
                emptyList()
            }.ifEmpty {
                listOf("Add dark mode toggle", "Refine mobile spacing", "Add interactive filters")
            }

            Result.success(
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
        } catch (e: TimeoutCancellationException) {
            Log.e(TAG, "AI generation timed out after ${GENERATION_TIMEOUT_MS}ms", e)
            Result.failure(
                IllegalStateException("Generation timed out after 60 seconds. Try a more focused prompt.")
            )
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.e(TAG, "Firebase AI generation failed", e)
            Result.failure(e)
        }
    }

    private companion object {
        const val TAG = "AppBuilderAiService"
        const val GENERATION_TIMEOUT_MS = 60_000L
    }
}
