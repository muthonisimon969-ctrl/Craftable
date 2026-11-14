package com.example.data.model

enum class TemplateType(val wireValue: String, val displayName: String) {
    WEB_APP("web_app", "Web App"),
    DASHBOARD("dashboard", "Dashboard"),
    LANDING_PAGE("landing_page", "Landing Page"),
    UTILITY("utility", "Utility Tool");

    companion object {
        fun fromWire(value: String): TemplateType =
            entries.firstOrNull { it.wireValue == value } ?: WEB_APP
    }
}

data class AppProject(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val initialPrompt: String = "",
    val templateType: String = TemplateType.WEB_APP.wireValue,
    val isStarred: Boolean = false,
    val version: Long = 1L,
    val htmlCode: String = "",
    val cssCode: String = "",
    val jsCode: String = "",
    val createdAtMillis: Long = System.currentTimeMillis(),
    val updatedAtMillis: Long = System.currentTimeMillis(),
)

data class ProjectMessage(
    val id: String = "",
    val projectId: String = "",
    val role: String = ROLE_USER,
    val content: String = "",
    val filesChanged: List<String> = emptyList(),
    val versionTag: Long = 1L,
    val createdAtMillis: Long = System.currentTimeMillis(),
) {
    companion object {
        const val ROLE_USER = "user"
        const val ROLE_ASSISTANT = "assistant"
    }
}

data class GeneratedAppBundle(
    val projectTitle: String,
    val description: String,
    val summary: String,
    val htmlCode: String,
    val cssCode: String,
    val jsCode: String,
    val changedFiles: List<String>,
    val followUpSuggestions: List<String>,
)
