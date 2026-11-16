package com.example.ui.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ai.AppBuilderAiService
import com.example.data.ai.DesignTemplate
import com.example.data.ai.DesignTemplateLibrary
import com.example.data.ai.StarterTemplateBundles
import com.example.data.model.AppProject
import com.example.data.model.TemplateType
import com.example.data.repository.ProjectRepository
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}

data class StarterPrompt(
    val title: String,
    val subtitle: String,
    val prompt: String,
    val templateType: TemplateType,
)

data class HomeUiState(
    val promptText: String = "",
    val selectedTemplate: TemplateType = TemplateType.WEB_APP,
    val searchQuery: String = "",
    val starredOnly: Boolean = false,
    val isBuilding: Boolean = false,
    val buildStatusMessage: String = "",
    val errorMessage: String? = null,
)

class HomeViewModel(
    private val repository: ProjectRepository,
    private val aiService: AppBuilderAiService,
) : ViewModel() {

    val projectsState: StateFlow<UiState<List<AppProject>>> =
        repository.observeProjects()
            .map<List<AppProject>, UiState<List<AppProject>>> { UiState.Success(it) }
            .catch { error ->
                if (error is CancellationException) throw error
                Log.w(TAG, "Error observing projects", error)
                emit(UiState.Error(error.localizedMessage ?: "Failed to load projects."))
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5000L),
                initialValue = UiState.Loading,
            )

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    private val _navigateToProject = MutableSharedFlow<String>()
    val navigateToProject: SharedFlow<String> = _navigateToProject.asSharedFlow()

    val curatedTemplates: List<DesignTemplate> = DesignTemplateLibrary.templates

    val starterPrompts = listOf(
        StarterPrompt(
            title = "Savanna Manual Pay",
            subtitle = "Kenyan KSh store with Till/Paybill & manual verification",
            prompt = "Build a modern Kenyan specialty market web store in Nairobi with KSh pricing, category filters, cart drawer, delivery zone selector, and manual M-Pesa payments (show Till and Paybill details with copy button, let customers enter their +254 phone and M-Pesa confirmation code without Daraja API, and include an owner verification tab).",
            templateType = TemplateType.WEB_APP,
        ),
        StarterPrompt(
            title = "Maison Vesper Atelier",
            subtitle = "Editorial luxury fashion house & lookbook bag",
            prompt = "Create an editorial luxury fashion brand site for Maison Vesper with quiet serif typography, seasonal collection lookbook, fabric provenance story, size selector modal, and shopping bag drawer.",
            templateType = TemplateType.LANDING_PAGE,
        ),
        StarterPrompt(
            title = "SaaS Revenue Pulse",
            subtitle = "Precision tech dashboard, SVG charts & plan toggle",
            prompt = "Build a sleek SaaS analytics dashboard with MRR metrics, an SVG revenue trend chart, customer tier breakdown, and an interactive monthly/annual pricing calculator.",
            templateType = TemplateType.DASHBOARD,
        ),
        StarterPrompt(
            title = "Osteria Solis Bistro",
            subtitle = "Warm restaurant menu, dietary filters & table booking",
            prompt = "Design an inviting artisanal restaurant website called Osteria Solis with seasonal menu filtering, dietary tags, signature dish visuals, and an interactive table reservation form.",
            templateType = TemplateType.LANDING_PAGE,
        ),
        StarterPrompt(
            title = "Meridian Advisory",
            subtitle = "Corporate consulting firm & retainer estimator",
            prompt = "Create an authoritative corporate financial advisory site called Meridian Advisory with practice pillars, impact metrics, client case studies, and an interactive consultation request form.",
            templateType = TemplateType.WEB_APP,
        ),
        StarterPrompt(
            title = "SplitEase Bill Tool",
            subtitle = "Tactile bill & tip splitter with instant totals",
            prompt = "Build a clean bill and tip splitter utility where users add diners, enter line items, pick tip percentages, and view exact per-person totals instantly.",
            templateType = TemplateType.UTILITY,
        ),
    )

    fun onPromptChanged(text: String) {
        _uiState.update { it.copy(promptText = text, errorMessage = null) }
    }

    fun onTemplateSelected(template: TemplateType) {
        _uiState.update { it.copy(selectedTemplate = template) }
    }

    fun onSearchChanged(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun onToggleStarFilter() {
        _uiState.update { it.copy(starredOnly = !it.starredOnly) }
    }

    fun applyStarterPrompt(starter: StarterPrompt) {
        _uiState.update {
            it.copy(
                promptText = starter.prompt,
                selectedTemplate = starter.templateType,
                errorMessage = null,
            )
        }
    }

    fun applyDesignTemplatePrompt(template: DesignTemplate) {
        _uiState.update {
            it.copy(
                promptText = template.starterPrompt,
                selectedTemplate = template.defaultTemplateType,
                errorMessage = null,
            )
        }
    }

    fun launchTemplateProject(template: DesignTemplate) {
        if (_uiState.value.isBuilding) return
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    isBuilding = true,
                    buildStatusMessage = "Opening ${template.name} template...",
                    errorMessage = null,
                )
            }
            try {
                val bundle = StarterTemplateBundles.buildForTemplate(template.id)
                val projectId = repository.createProject(
                    prompt = template.starterPrompt,
                    templateType = template.defaultTemplateType,
                    bundle = bundle,
                ).getOrElse { err ->
                    _uiState.update {
                        it.copy(
                            isBuilding = false,
                            buildStatusMessage = "",
                            errorMessage = err.localizedMessage ?: "Failed to open template.",
                        )
                    }
                    return@launch
                }
                _uiState.update {
                    it.copy(
                        isBuilding = false,
                        buildStatusMessage = "",
                    )
                }
                _navigateToProject.emit(projectId)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Failed to launch template", e)
                _uiState.update {
                    it.copy(
                        isBuilding = false,
                        buildStatusMessage = "",
                        errorMessage = e.localizedMessage ?: "Unexpected error opening template.",
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }

    fun craftNewProject() {
        val prompt = _uiState.value.promptText.trim()
        if (prompt.isEmpty() || _uiState.value.isBuilding) return
        val template = _uiState.value.selectedTemplate

        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    isBuilding = true,
                    buildStatusMessage = "Connecting to Craft AI...",
                    errorMessage = null,
                )
            }
            try {
                val bundleResult = aiService.generateNewApp(
                    prompt = prompt,
                    templateType = template,
                    onStageUpdate = { stage ->
                        _uiState.update { it.copy(buildStatusMessage = stage) }
                    },
                )
                val bundle = bundleResult.getOrElse { err ->
                    _uiState.update {
                        it.copy(
                            isBuilding = false,
                            buildStatusMessage = "",
                            errorMessage = err.localizedMessage ?: "Craft AI did not complete this request.",
                        )
                    }
                    return@launch
                }

                _uiState.update {
                    it.copy(buildStatusMessage = "Saving project locally...")
                }

                val createResult = repository.createProject(prompt, template, bundle)
                val projectId = createResult.getOrElse { err ->
                    _uiState.update {
                        it.copy(
                            isBuilding = false,
                            buildStatusMessage = "",
                            errorMessage = err.localizedMessage ?: "Failed to save project.",
                        )
                    }
                    return@launch
                }

                _uiState.update {
                    it.copy(
                        promptText = "",
                        isBuilding = false,
                        buildStatusMessage = "",
                    )
                }
                _navigateToProject.emit(projectId)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Failed to craft project", e)
                _uiState.update {
                    it.copy(
                        isBuilding = false,
                        buildStatusMessage = "",
                        errorMessage = e.localizedMessage ?: "Unexpected error crafting app.",
                    )
                }
            }
        }
    }

    fun toggleStar(project: AppProject) {
        viewModelScope.launch {
            repository.toggleStarred(project.id, !project.isStarred).onFailure { err ->
                _uiState.update {
                    it.copy(errorMessage = err.localizedMessage ?: "Could not update favorite.")
                }
            }
        }
    }

    fun renameProject(projectId: String, title: String, description: String) {
        viewModelScope.launch {
            repository.renameProject(projectId, title, description).onFailure { err ->
                _uiState.update {
                    it.copy(errorMessage = err.localizedMessage ?: "Could not rename project.")
                }
            }
        }
    }

    fun deleteProject(projectId: String) {
        viewModelScope.launch {
            repository.deleteProject(projectId).onFailure { err ->
                _uiState.update {
                    it.copy(errorMessage = err.localizedMessage ?: "Could not delete project.")
                }
            }
        }
    }

    private companion object {
        const val TAG = "HomeViewModel"
    }
}
