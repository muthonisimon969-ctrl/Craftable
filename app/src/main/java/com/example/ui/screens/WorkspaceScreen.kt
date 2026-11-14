package com.example.ui.screens

import android.content.Intent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.R
import com.example.data.model.AppProject
import com.example.ui.components.BuilderChatPane
import com.example.ui.components.CodeExplorerPane
import com.example.ui.components.WebPreviewPane
import com.example.ui.theme.AmberSpark
import com.example.ui.theme.JetBrainsMonoFamily
import com.example.ui.viewmodel.UiState
import com.example.ui.viewmodel.WorkspaceTab
import com.example.ui.viewmodel.WorkspaceViewModel
import com.example.util.WebBundleAssembler

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkspaceScreen(
    viewModel: WorkspaceViewModel,
    onNavigateBack: () -> Unit,
) {
    val context = LocalContext.current
    val projectState by viewModel.projectState.collectAsStateWithLifecycle()
    val messagesState by viewModel.messagesState.collectAsStateWithLifecycle()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    var showRenameDialog by remember { mutableStateOf(false) }

    val loadedProject = (projectState as? UiState.Success)?.data

    LaunchedEffect(loadedProject?.id, loadedProject?.version) {
        if (loadedProject != null) {
            viewModel.syncProjectCodeIfNeeded(loadedProject)
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets.safeDrawing,
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
                navigationIcon = {
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier.testTag("workspace_back_button"),
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back to projects",
                        )
                    }
                },
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable(enabled = loadedProject != null) {
                            showRenameDialog = true
                        },
                    ) {
                        Text(
                            text = loadedProject?.title ?: "Workspace",
                            style = MaterialTheme.typography.titleLarge,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f, fill = false),
                        )
                        if (loadedProject != null) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.secondaryContainer,
                            ) {
                                Text(
                                    text = "v${loadedProject.version}",
                                    fontFamily = JetBrainsMonoFamily,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSecondaryContainer,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                )
                            }
                        }
                    }
                },
                actions = {
                    if (loadedProject != null) {
                        IconButton(
                            onClick = { viewModel.toggleStar(loadedProject) },
                            modifier = Modifier.testTag("workspace_star_button"),
                        ) {
                            Icon(
                                imageVector = if (loadedProject.isStarred) {
                                    Icons.Filled.Star
                                } else {
                                    Icons.Outlined.StarBorder
                                },
                                contentDescription = "Toggle favorite",
                                tint = if (loadedProject.isStarred) {
                                    AmberSpark
                                } else {
                                    MaterialTheme.colorScheme.onSurfaceVariant
                                },
                            )
                        }

                        IconButton(
                            onClick = {
                                val exportedHtml = WebBundleAssembler.assembleStandaloneExport(
                                    title = loadedProject.title,
                                    htmlCode = uiState.draftHtml.ifBlank { loadedProject.htmlCode },
                                    cssCode = uiState.draftCss.ifBlank { loadedProject.cssCode },
                                    jsCode = uiState.draftJs.ifBlank { loadedProject.jsCode },
                                )
                                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/html"
                                    putExtra(Intent.EXTRA_SUBJECT, "${loadedProject.title} — Craftable App")
                                    putExtra(Intent.EXTRA_TEXT, exportedHtml)
                                }
                                context.startActivity(
                                    Intent.createChooser(shareIntent, "Export Standalone HTML")
                                )
                            },
                            modifier = Modifier.testTag("export_html_button"),
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Share,
                                contentDescription = stringResource(id = R.string.export_html),
                            )
                        }
                    }
                },
            )
        },
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .imePadding(),
        ) {
            when (val pState = projectState) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                    }
                }

                is UiState.Error -> {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = pState.message,
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.error,
                        )
                    }
                }

                is UiState.Success -> {
                    val project = pState.data
                    if (project == null) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(
                                text = "Project not found.",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    } else {
                        val messages = (messagesState as? UiState.Success)?.data ?: emptyList()

                        Column(modifier = Modifier.fillMaxSize()) {
                            AnimatedVisibility(visible = uiState.errorMessage != null) {
                                Surface(
                                    color = MaterialTheme.colorScheme.error.copy(alpha = 0.14f),
                                    border = BorderStroke(
                                        1.dp,
                                        MaterialTheme.colorScheme.error.copy(alpha = 0.45f),
                                    ),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { viewModel.clearError() },
                                ) {
                                    Text(
                                        text = uiState.errorMessage.orEmpty(),
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.error,
                                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                                    )
                                }
                            }

                            BoxWithConstraints(modifier = Modifier.weight(1f)) {
                                val isWideScreen = maxWidth >= 840.dp

                                if (isWideScreen) {
                                    // Tablet / Desktop Split-Pane Workspace
                                    Row(modifier = Modifier.fillMaxSize()) {
                                        Box(
                                            modifier = Modifier
                                                .weight(0.4f)
                                                .fillMaxHeight(),
                                        ) {
                                            BuilderChatPane(
                                                messages = messages,
                                                promptInput = uiState.promptInput,
                                                isGenerating = uiState.isGenerating,
                                                generationStage = uiState.generationStage,
                                                followUpSuggestions = uiState.followUpSuggestions,
                                                onPromptChanged = viewModel::onPromptChanged,
                                                onSendPrompt = {
                                                    viewModel.sendIterationPrompt(project)
                                                },
                                                onTapSuggestion = { suggestion ->
                                                    viewModel.sendIterationPrompt(project, suggestion)
                                                },
                                            )
                                        }

                                        VerticalDivider(color = MaterialTheme.colorScheme.outline)

                                        Column(
                                            modifier = Modifier
                                                .weight(0.6f)
                                                .fillMaxHeight(),
                                        ) {
                                            val rightTab = if (uiState.activeTab == WorkspaceTab.CODE) {
                                                WorkspaceTab.CODE
                                            } else {
                                                WorkspaceTab.PREVIEW
                                            }
                                            Box(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                                contentAlignment = Alignment.CenterEnd,
                                            ) {
                                                SingleChoiceSegmentedButtonRow {
                                                    listOf(WorkspaceTab.PREVIEW, WorkspaceTab.CODE).forEachIndexed { idx, tab ->
                                                        SegmentedButton(
                                                            selected = rightTab == tab,
                                                            onClick = { viewModel.selectTab(tab) },
                                                            shape = SegmentedButtonDefaults.itemShape(idx, 2),
                                                            label = {
                                                                Text(
                                                                    if (tab == WorkspaceTab.PREVIEW) {
                                                                        stringResource(id = R.string.tab_preview)
                                                                    } else {
                                                                        stringResource(id = R.string.tab_code)
                                                                    }
                                                                )
                                                            },
                                                        )
                                                    }
                                                }
                                            }

                                            Box(modifier = Modifier.weight(1f)) {
                                                if (rightTab == WorkspaceTab.CODE) {
                                                    CodeExplorerSection(project, uiState, viewModel)
                                                } else {
                                                    WebPreviewSection(project, uiState, viewModel)
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    // Mobile Compact Workspace with 3-Mode Segmented Switcher
                                    Column(modifier = Modifier.fillMaxSize()) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .background(MaterialTheme.colorScheme.surface)
                                                .padding(horizontal = 16.dp, vertical = 8.dp),
                                            contentAlignment = Alignment.Center,
                                        ) {
                                            SingleChoiceSegmentedButtonRow(
                                                modifier = Modifier.fillMaxWidth(),
                                            ) {
                                                WorkspaceTab.entries.forEachIndexed { idx, tab ->
                                                    val labelText = when (tab) {
                                                        WorkspaceTab.CHAT -> stringResource(id = R.string.tab_chat)
                                                        WorkspaceTab.PREVIEW -> stringResource(id = R.string.tab_preview)
                                                        WorkspaceTab.CODE -> stringResource(id = R.string.tab_code)
                                                    }
                                                    val iconVec = when (tab) {
                                                        WorkspaceTab.CHAT -> Icons.AutoMirrored.Filled.Chat
                                                        WorkspaceTab.PREVIEW -> Icons.Filled.PlayArrow
                                                        WorkspaceTab.CODE -> Icons.Filled.Code
                                                    }
                                                    SegmentedButton(
                                                        selected = uiState.activeTab == tab,
                                                        onClick = { viewModel.selectTab(tab) },
                                                        shape = SegmentedButtonDefaults.itemShape(
                                                            index = idx,
                                                            count = WorkspaceTab.entries.size,
                                                        ),
                                                        icon = {
                                                            Icon(
                                                                imageVector = iconVec,
                                                                contentDescription = null,
                                                                modifier = Modifier.size(16.dp),
                                                            )
                                                        },
                                                        label = { Text(labelText) },
                                                        modifier = Modifier.testTag("workspace_tab_${tab.name.lowercase()}"),
                                                    )
                                                }
                                            }
                                        }

                                        Box(modifier = Modifier.weight(1f)) {
                                            when (uiState.activeTab) {
                                                WorkspaceTab.CHAT -> {
                                                    BuilderChatPane(
                                                        messages = messages,
                                                        promptInput = uiState.promptInput,
                                                        isGenerating = uiState.isGenerating,
                                                        generationStage = uiState.generationStage,
                                                        followUpSuggestions = uiState.followUpSuggestions,
                                                        onPromptChanged = viewModel::onPromptChanged,
                                                        onSendPrompt = {
                                                            viewModel.sendIterationPrompt(project)
                                                        },
                                                        onTapSuggestion = { suggestion ->
                                                            viewModel.sendIterationPrompt(project, suggestion)
                                                        },
                                                    )
                                                }

                                                WorkspaceTab.PREVIEW -> {
                                                    WebPreviewSection(project, uiState, viewModel)
                                                }

                                                WorkspaceTab.CODE -> {
                                                    CodeExplorerSection(project, uiState, viewModel)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showRenameDialog && loadedProject != null) {
        RenameProjectDialog(
            initialTitle = loadedProject.title,
            initialDescription = loadedProject.description,
            onDismiss = { showRenameDialog = false },
            onConfirm = { newTitle, newDesc ->
                viewModel.renameProject(newTitle, newDesc)
                showRenameDialog = false
            },
        )
    }
}

@Composable
private fun WebPreviewSection(
    project: AppProject,
    uiState: com.example.ui.viewmodel.WorkspaceUiState,
    viewModel: WorkspaceViewModel,
) {
    WebPreviewPane(
        title = project.title,
        htmlCode = if (uiState.isCodeInitialized) uiState.draftHtml else project.htmlCode,
        cssCode = if (uiState.isCodeInitialized) uiState.draftCss else project.cssCode,
        jsCode = if (uiState.isCodeInitialized) uiState.draftJs else project.jsCode,
        reloadNonce = uiState.reloadNonce,
        isMobileViewport = uiState.isMobileViewport,
        consoleLogs = uiState.consoleLogs,
        showConsoleSheet = uiState.showConsoleSheet,
        onToggleViewport = viewModel::toggleViewportMode,
        onReload = viewModel::reloadPreview,
        onOpenConsole = { viewModel.setShowConsoleSheet(true) },
        onDismissConsole = { viewModel.setShowConsoleSheet(false) },
        onClearConsole = viewModel::clearConsoleLogs,
        onConsoleMessage = viewModel::appendConsoleLog,
    )
}

@Composable
private fun CodeExplorerSection(
    project: AppProject,
    uiState: com.example.ui.viewmodel.WorkspaceUiState,
    viewModel: WorkspaceViewModel,
) {
    CodeExplorerPane(
        selectedFile = uiState.selectedCodeFile,
        htmlCode = if (uiState.isCodeInitialized) uiState.draftHtml else project.htmlCode,
        cssCode = if (uiState.isCodeInitialized) uiState.draftCss else project.cssCode,
        jsCode = if (uiState.isCodeInitialized) uiState.draftJs else project.jsCode,
        hasUnsavedChanges = uiState.hasUnsavedCodeChanges,
        isSaving = uiState.isSavingCode,
        onSelectFile = viewModel::selectCodeFile,
        onCodeChanged = viewModel::onCodeDraftChanged,
        onSaveAndRun = { viewModel.saveAndRunManualCode(project) },
    )
}
