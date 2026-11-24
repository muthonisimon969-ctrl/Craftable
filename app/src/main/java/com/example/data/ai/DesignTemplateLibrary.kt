package com.example.data.ai

import com.example.data.model.TemplateType

data class DesignTemplate(
    val id: String,
    val name: String,
    val badgeLabel: String,
    val shortSummary: String,
    val industries: List<String>,
    val visualDirection: String,
    val colorSystem: String,
    val typographyPairing: String,
    val layoutBlueprint: String,
    val interactivePatterns: String,
    val starterPrompt: String,
    val defaultTemplateType: TemplateType,
    val canvasHex: Long,
    val surfaceHex: Long,
    val accentHex: Long,
)

object DesignTemplateLibrary {
    // Fixed design archetypes are disabled so the AI creates a fresh design
    // from the user's brief instead of being constrained to preset templates.
    val templates: List<DesignTemplate> = emptyList()

    fun promptCatalogSummary(): String = ""

    fun findById(id: String): DesignTemplate? = templates.firstOrNull { it.id == id }
}
