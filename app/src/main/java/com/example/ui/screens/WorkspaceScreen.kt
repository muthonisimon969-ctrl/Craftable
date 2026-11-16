package com.example.ui.screens

import android.content.Intent
import androidx.activity.compose.BackHandler
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
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
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
    var showOverflowMenu by remember { mutableStateOf(false) }

    val loadedProject = (projectState as? UiState.Success)?.data

    LaunchedEffect(loadedProject?.id, loadedProject?.version) {
        if (loadedProject != null) {
            viewModel.syncProjectCodeIfNeeded(loadedProject)
        }
    }

    BackHandler(enabled = uiState.isFullscreenPreview) {
        viewModel.setFullscreenPreview(false)
    }

    Scaffold(
        contentWindowInsets = WindowInsets.safeDrawing,
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            if (!uiState.isFullscreenPreview) {
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
                        if (uiState.activeTab == WorkspaceTab.PREVIEW) {
                            IconButton(
                                onClick = viewModel::reloadPreview,
                                modifier = Modifier.testTag("reload_preview_button"),
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Refresh,
                                    contentDescription = "Reload live preview",
                                )
                            }

                            IconButton(
                                onClick = { viewModel.setShowConsoleSheet(true) },
                                modifier = Modifier.testTag("open_console_button"),
                            ) {
                                BadgedBox(
                                    badge = {
                                        if (uiState.consoleLogs.isNotEmpty()) {
                                            Badge {
                                                Text("${uiState.consoleLogs.size}")
                                            }
                                        }
                                    }
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.Terminal,
                                        contentDescription = "View console logs",
                                    )
                                }
                            }

                            IconButton(
                                onClick = viewModel::toggleFullscreenPreview,
                                modifier = Modifier.testTag("fullscreen_preview_button"),
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Fullscreen,
                                    contentDescription = "Expand preview fullscreen",
                                )
                            }
                        }

                        Box {
                            IconButton(
                                onClick = { showOverflowMenu = true },
                                modifier = Modifier.testTag("workspace_more_button"),
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.MoreVert,
                                    contentDescription = "Project actions",
                                )
                            }
                            DropdownMenu(
                                expanded = showOverflowMenu,
                                onDismissRequest = { showOverflowMenu = false },
                            ) {
                                DropdownMenuItem(
                                    text = {
                                        Text(
                                            if (loadedProject.isStarred) "Remove from Starred" else "Add to Starred"
                                        )
                                    },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = if (loadedProject.isStarred) {
                                                Icons.Filled.Star
                                            } else {
                                                Icons.Outlined.StarBorder
                                            },
                                            contentDescription = null,
                                            tint = if (loadedProject.isStarred) {
                                                AmberSpark
                                            } else {
                                                MaterialTheme.colorScheme.onSurfaceVariant
                                            },
                                        )
                                    },
                                    onClick = {
                                        showOverflowMenu = false
                                        viewModel.toggleStar(loadedProject)
                                    },
                                    modifier = Modifier.testTag("workspace_star_button"),
                                )
                                DropdownMenuItem(
                                    text = { Text(stringResource(id = R.string.rename_project)) },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = Icons.Filled.Edit,
                                            contentDescription = null,
                                        )
                                    },
                                    onClick = {
                                        showOverflowMenu = false
                                        showRenameDialog = true
                                    },
                                )
                                DropdownMenuItem(
                                    text = { Text(stringResource(id = R.string.export_html)) },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = Icons.Filled.Share,
                                            contentDescription = null,
                                        )
                                    },
                                    onClick = {
                                        showOverflowMenu = false
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
                                )
                            }
                        }
                    }
                },
                )
            }
        },
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .consumeWindowInsets(innerPadding),
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

                                if (uiState.isFullscreenPreview && (!isWideScreen && uiState.activeTab == WorkspaceTab.PREVIEW || isWideScreen)) {
                                    WebPreviewSection(project, uiState, viewModel)
                                } else if (isWideScreen) {
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
                                                pendingUserPrompt = uiState.pendingUserPrompt,
                                                failedUserPrompt = uiState.failedUserPrompt,
                                                errorMessage = uiState.errorMessage,
                                                onRetryFailedPrompt = { viewModel.retryLastPrompt(project) },
                                                onDismissError = viewModel::clearError,
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
                                        if (!uiState.isFullscreenPreview) {
                                            Box(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .background(MaterialTheme.colorScheme.surface)
                                                    .padding(horizontal = 16.dp, vertical = 6.dp),
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
                                                        pendingUserPrompt = uiState.pendingUserPrompt,
                                                        failedUserPrompt = uiState.failedUserPrompt,
                                                        errorMessage = uiState.errorMessage,
                                                        onRetryFailedPrompt = { viewModel.retryLastPrompt(project) },
                                                        onDismissError = viewModel::clearError,
                                                        onOpenPreview = {
                                                            viewModel.selectTab(WorkspaceTab.PREVIEW)
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
        isFullscreen = uiState.isFullscreenPreview,
        consoleLogs = uiState.consoleLogs,
        showConsoleSheet = uiState.showConsoleSheet,
        onToggleFullscreen = viewModel::toggleFullscreenPreview,
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
