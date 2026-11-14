package com.example.ui.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ai.AppBuilderAiService
import com.example.data.model.AppProject
import com.example.data.model.ProjectMessage
import com.example.data.repository.ProjectRepository
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class WorkspaceTab {
    CHAT,
    PREVIEW,
    CODE,
}

enum class CodeFileTab(val filename: String) {
    INDEX_HTML("index.html"),
    STYLES_CSS("styles.css"),
    APP_JS("app.js"),
}

data class ConsoleEntry(
    val level: String,
    val message: String,
    val timestampMs: Long = System.currentTimeMillis(),
)

data class WorkspaceUiState(
    val activeTab: WorkspaceTab = WorkspaceTab.PREVIEW,
    val selectedCodeFile: CodeFileTab = CodeFileTab.INDEX_HTML,
    val isMobileViewport: Boolean = true,
    val promptInput: String = "",
    val isGenerating: Boolean = false,
    val generationStage: String = "",
    val followUpSuggestions: List<String> = listOf(
        "Add dark/light theme toggle",
        "Enhance visual polish & shadows",
        "Add interactive search filter",
    ),
    val draftHtml: String = "",
    val draftCss: String = "",
    val draftJs: String = "",
    val isCodeInitialized: Boolean = false,
    val hasUnsavedCodeChanges: Boolean = false,
    val isSavingCode: Boolean = false,
    val reloadNonce: Int = 0,
    val consoleLogs: List<ConsoleEntry> = emptyList(),
    val showConsoleSheet: Boolean = false,
    val errorMessage: String? = null,
)

class WorkspaceViewModel(
    private val repository: ProjectRepository,
    private val aiService: AppBuilderAiService,
    private val projectId: String,
) : ViewModel() {

    val projectState: StateFlow<UiState<AppProject?>> =
        repository.observeProject(projectId)
            .map<AppProject?, UiState<AppProject?>> { UiState.Success(it) }
            .catch { error ->
                if (error is CancellationException) throw error
                Log.w(TAG, "Error observing project", error)
                emit(UiState.Error(error.localizedMessage ?: "Failed to load project."))
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5000L),
                initialValue = UiState.Loading,
            )

    val messagesState: StateFlow<UiState<List<ProjectMessage>>> =
        repository.observeMessages(projectId)
            .map<List<ProjectMessage>, UiState<List<ProjectMessage>>> { UiState.Success(it) }
            .catch { error ->
                if (error is CancellationException) throw error
                Log.w(TAG, "Error observing messages", error)
                emit(UiState.Error(error.localizedMessage ?: "Failed to load chat history."))
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5000L),
                initialValue = UiState.Loading,
            )

    private val _uiState = MutableStateFlow(WorkspaceUiState())
    val uiState: StateFlow<WorkspaceUiState> = _uiState.asStateFlow()

    private var lastSyncedVersion: Long = -1L

    fun syncProjectCodeIfNeeded(project: AppProject) {
        if (!_uiState.value.isCodeInitialized ||
            (project.version != lastSyncedVersion && !_uiState.value.hasUnsavedCodeChanges)
        ) {
            lastSyncedVersion = project.version
            _uiState.update {
                it.copy(
                    draftHtml = project.htmlCode,
                    draftCss = project.cssCode,
                    draftJs = project.jsCode,
                    isCodeInitialized = true,
                    hasUnsavedCodeChanges = false,
                    reloadNonce = it.reloadNonce + 1,
                )
            }
        }
    }

    fun selectTab(tab: WorkspaceTab) {
        _uiState.update { it.copy(activeTab = tab) }
    }

    fun selectCodeFile(file: CodeFileTab) {
        _uiState.update { it.copy(selectedCodeFile = file) }
    }

    fun toggleViewportMode() {
        _uiState.update { it.copy(isMobileViewport = !it.isMobileViewport) }
    }

    fun reloadPreview() {
        _uiState.update {
            it.copy(
                consoleLogs = emptyList(),
                reloadNonce = it.reloadNonce + 1,
            )
        }
    }

    fun setShowConsoleSheet(visible: Boolean) {
        _uiState.update { it.copy(showConsoleSheet = visible) }
    }

    fun clearConsoleLogs() {
        _uiState.update { it.copy(consoleLogs = emptyList()) }
    }

    fun appendConsoleLog(level: String, message: String) {
        _uiState.update { state ->
            val updated = (state.consoleLogs + ConsoleEntry(level, message)).takeLast(100)
            state.copy(consoleLogs = updated)
        }
    }

    fun onPromptChanged(text: String) {
        _uiState.update { it.copy(promptInput = text, errorMessage = null) }
    }

    fun onCodeDraftChanged(newContent: String) {
        _uiState.update { state ->
            when (state.selectedCodeFile) {
                CodeFileTab.INDEX_HTML -> state.copy(draftHtml = newContent, hasUnsavedCodeChanges = true)
                CodeFileTab.STYLES_CSS -> state.copy(draftCss = newContent, hasUnsavedCodeChanges = true)
                CodeFileTab.APP_JS -> state.copy(draftJs = newContent, hasUnsavedCodeChanges = true)
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }

    fun sendIterationPrompt(project: AppProject, overridePrompt: String? = null) {
        val prompt = (overridePrompt ?: _uiState.value.promptInput).trim()
        if (prompt.isEmpty() || _uiState.value.isGenerating) return

        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    promptInput = if (overridePrompt == null) "" else it.promptInput,
                    isGenerating = true,
                    generationStage = "Analyzing current code & crafting updates...",
                    errorMessage = null,
                )
            }

            try {
                val bundle = aiService.iterateExistingApp(project, prompt).getOrElse { err ->
                    _uiState.update {
                        it.copy(
                            isGenerating = false,
                            generationStage = "",
                            errorMessage = err.localizedMessage ?: "Failed to update app.",
                        )
                    }
                    return@launch
                }

                _uiState.update { it.copy(generationStage = "Deploying v${project.version + 1} to preview...") }

                val newVersion = repository.applyIterationTurn(
                    projectId = project.id,
                    prompt = prompt,
                    currentVersion = project.version,
                    bundle = bundle,
                ).getOrElse { err ->
                    _uiState.update {
                        it.copy(
                            isGenerating = false,
                            generationStage = "",
                            errorMessage = err.localizedMessage ?: "Failed to save updated code.",
                        )
                    }
                    return@launch
                }

                lastSyncedVersion = newVersion
                _uiState.update {
                    it.copy(
                        isGenerating = false,
                        generationStage = "",
                        draftHtml = bundle.htmlCode,
                        draftCss = bundle.cssCode,
                        draftJs = bundle.jsCode,
                        hasUnsavedCodeChanges = false,
                        followUpSuggestions = bundle.followUpSuggestions,
                        consoleLogs = emptyList(),
                        reloadNonce = it.reloadNonce + 1,
                    )
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Iteration prompt failed", e)
                _uiState.update {
                    it.copy(
                        isGenerating = false,
                        generationStage = "",
                        errorMessage = e.localizedMessage ?: "Unexpected error during build.",
                    )
                }
            }
        }
    }

    fun saveAndRunManualCode(project: AppProject) {
        val state = _uiState.value
        if (state.isSavingCode) return

        viewModelScope.launch {
            _uiState.update { it.copy(isSavingCode = true, errorMessage = null) }
            repository.updateProjectCodeManual(
                projectId = project.id,
                currentVersion = project.version,
                htmlCode = state.draftHtml,
                cssCode = state.draftCss,
                jsCode = state.draftJs,
            ).onSuccess {
                lastSyncedVersion = project.version + 1L
                _uiState.update {
                    it.copy(
                        isSavingCode = false,
                        hasUnsavedCodeChanges = false,
                        consoleLogs = emptyList(),
                        reloadNonce = it.reloadNonce + 1,
                        activeTab = WorkspaceTab.PREVIEW,
                    )
                }
            }.onFailure { err ->
                _uiState.update {
                    it.copy(
                        isSavingCode = false,
                        errorMessage = err.localizedMessage ?: "Failed to save code edits.",
                    )
                }
            }
        }
    }

    fun toggleStar(project: AppProject) {
        viewModelScope.launch {
            repository.toggleStarred(project.id, !project.isStarred).onFailure { err ->
                _uiState.update {
                    it.copy(errorMessage = err.localizedMessage ?: "Could not update star.")
                }
            }
        }
    }

    fun renameProject(newTitle: String, newDescription: String) {
        viewModelScope.launch {
            repository.renameProject(projectId, newTitle, newDescription).onFailure { err ->
                _uiState.update {
                    it.copy(errorMessage = err.localizedMessage ?: "Could not rename project.")
                }
            }
        }
    }

    private companion object {
        const val TAG = "WorkspaceViewModel"
    }
}
