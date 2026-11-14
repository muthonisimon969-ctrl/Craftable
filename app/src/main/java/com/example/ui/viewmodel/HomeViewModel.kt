package com.example.ui.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ai.AppBuilderAiService
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

    val starterPrompts = listOf(
        StarterPrompt(
            title = "SaaS Revenue Pulse",
            subtitle = "MRR charts, cohort cards & live plan calculator",
            prompt = "Build a sleek SaaS analytics dashboard with MRR metrics, an SVG revenue trend chart, customer tier breakdown, and an interactive pricing calculator.",
            templateType = TemplateType.DASHBOARD,
        ),
        StarterPrompt(
            title = "Zen Focus Studio",
            subtitle = "Pomodoro timer, task queue & ambient progress ring",
            prompt = "Create a minimalist Pomodoro focus & task tracker app with a circular SVG timer ring, customizable focus/break durations, task checklist, and daily focus streak counter.",
            templateType = TemplateType.WEB_APP,
        ),
        StarterPrompt(
            title = "Roast & Bloom Cafe",
            subtitle = "Artisanal coffee shop landing page & cart drawer",
            prompt = "Design a warm editorial landing page for a specialty coffee roastery called Roast & Bloom with hero showcase, roast filter menu, tasting notes, and interactive bag drawer.",
            templateType = TemplateType.LANDING_PAGE,
        ),
        StarterPrompt(
            title = "SplitEase Bill Tool",
            subtitle = "Smart dinner bill & tip splitter with item assignment",
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
                    buildStatusMessage = "Designing layout & writing interactive code...",
                    errorMessage = null,
                )
            }
            try {
                val bundleResult = aiService.generateNewApp(prompt, template)
                val bundle = bundleResult.getOrElse { err ->
                    _uiState.update {
                        it.copy(
                            isBuilding = false,
                            buildStatusMessage = "",
                            errorMessage = err.localizedMessage ?: "AI generation failed.",
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
