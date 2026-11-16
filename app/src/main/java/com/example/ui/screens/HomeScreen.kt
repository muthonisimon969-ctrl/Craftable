package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.R
import com.example.data.ai.DesignTemplate
import com.example.data.model.AppProject
import com.example.data.model.TemplateType
import com.example.ui.theme.AmberSpark
import com.example.ui.theme.CoralPrimary
import com.example.ui.theme.EmeraldLive
import com.example.ui.theme.IndigoAccent
import com.example.ui.theme.JetBrainsMonoFamily
import com.example.ui.viewmodel.HomeViewModel
import com.example.ui.viewmodel.UiState
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    isDarkTheme: Boolean,
    onToggleTheme: () -> Unit,
    onOpenProject: (String) -> Unit,
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val projectsState by viewModel.projectsState.collectAsStateWithLifecycle()

    var projectToRename by remember { mutableStateOf<AppProject?>(null) }
    var projectToDelete by remember { mutableStateOf<AppProject?>(null) }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        viewModel.navigateToProject.collect { newProjectId ->
            onOpenProject(newProjectId)
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets.safeDrawing,
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                ),
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Image(
                            painter = painterResource(id = R.drawable.craftable_icon_1794658566884),
                            contentDescription = "Craftable logo",
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(9.dp)),
                            contentScale = ContentScale.Crop,
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = stringResource(id = R.string.app_name),
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onBackground,
                        )
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(999.dp),
                        color = MaterialTheme.colorScheme.surfaceContainer,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                        modifier = Modifier.padding(end = 4.dp),
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(EmeraldLive)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Studio",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }

                    IconButton(
                        onClick = onToggleTheme,
                        modifier = Modifier.testTag("toggle_theme_button"),
                    ) {
                        Icon(
                            imageVector = if (isDarkTheme) Icons.Filled.LightMode else Icons.Filled.DarkMode,
                            contentDescription = "Toggle light or dark studio theme",
                        )
                    }
                },
            )
        },
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .consumeWindowInsets(innerPadding),
            contentAlignment = Alignment.TopCenter,
        ) {
            LazyColumn(
                state = listState,
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier
                    .widthIn(max = 880.dp)
                    .fillMaxSize(),
            ) {
                // Hero Prompt Studio Composer
                item(key = "prompt_composer") {
                    PromptComposerHero(
                        promptText = uiState.promptText,
                        selectedTemplate = uiState.selectedTemplate,
                        isBuilding = uiState.isBuilding,
                        buildStatus = uiState.buildStatusMessage,
                        errorMessage = uiState.errorMessage,
                        onPromptChanged = viewModel::onPromptChanged,
                        onTemplateSelected = viewModel::onTemplateSelected,
                        onCraftClick = viewModel::craftNewProject,
                        onDismissError = viewModel::clearError,
                    )
                }

                // Curated Studio Templates Gallery
                item(key = "starter_ideas") {
                    Column {
                        Text(
                            text = "Curated studio templates",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Open a ready-to-use app immediately or load its prompt into Craft AI",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            viewModel.curatedTemplates.forEach { template ->
                                CuratedTemplateCard(
                                    template = template,
                                    enabled = !uiState.isBuilding,
                                    onOpenLiveApp = { viewModel.launchTemplateProject(template) },
                                    onUsePrompt = {
                                        viewModel.applyDesignTemplatePrompt(template)
                                        coroutineScope.launch { listState.animateScrollToItem(0) }
                                    },
                                )
                            }
                        }
                    }
                }

                // Projects Header + Search/Filter
                item(key = "projects_header") {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text(
                                text = stringResource(id = R.string.recent_projects),
                                style = MaterialTheme.typography.headlineSmall,
                                color = MaterialTheme.colorScheme.onBackground,
                            )

                            FilterChip(
                                selected = uiState.starredOnly,
                                onClick = viewModel::onToggleStarFilter,
                                label = { Text("Starred") },
                                leadingIcon = {
                                    Icon(
                                        imageVector = if (uiState.starredOnly) Icons.Filled.Star else Icons.Outlined.StarBorder,
                                        contentDescription = null,
                                        tint = if (uiState.starredOnly) AmberSpark else MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(16.dp),
                                    )
                                },
                                modifier = Modifier.testTag("filter_starred_chip"),
                            )
                        }

                        OutlinedTextField(
                            value = uiState.searchQuery,
                            onValueChange = viewModel::onSearchChanged,
                            placeholder = { Text("Search projects...") },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Filled.Search,
                                    contentDescription = null,
                                )
                            },
                            trailingIcon = {
                                if (uiState.searchQuery.isNotEmpty()) {
                                    IconButton(onClick = { viewModel.onSearchChanged("") }) {
                                        Icon(
                                            imageVector = Icons.Filled.Close,
                                            contentDescription = "Clear search",
                                        )
                                    }
                                }
                            },
                            singleLine = true,
                            shape = MaterialTheme.shapes.medium,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("search_projects_input"),
                        )
                    }
                }

                // Projects List States
                when (val state = projectsState) {
                    is UiState.Loading -> {
                        item(key = "projects_loading") {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 36.dp),
                                contentAlignment = Alignment.Center,
                            ) {
                                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }

                    is UiState.Error -> {
                        item(key = "projects_error") {
                            Surface(
                                color = MaterialTheme.colorScheme.error.copy(alpha = 0.12f),
                                shape = MaterialTheme.shapes.medium,
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.4f)),
                                modifier = Modifier.fillMaxWidth(),
                            ) {
                                Text(
                                    text = state.message,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.padding(16.dp),
                                )
                            }
                        }
                    }

                    is UiState.Success -> {
                        val filtered = state.data.filter { project ->
                            val matchesStar = !uiState.starredOnly || project.isStarred
                            val q = uiState.searchQuery.trim().lowercase()
                            val matchesQuery = q.isEmpty() ||
                                project.title.lowercase().contains(q) ||
                                project.description.lowercase().contains(q)
                            matchesStar && matchesQuery
                        }

                        if (filtered.isEmpty()) {
                            item(key = "projects_empty") {
                                EmptyProjectsCard(
                                    isFiltered = state.data.isNotEmpty(),
                                )
                            }
                        } else {
                            items(filtered, key = { it.id }) { project ->
                                ProjectCard(
                                    project = project,
                                    onOpen = { onOpenProject(project.id) },
                                    onToggleStar = { viewModel.toggleStar(project) },
                                    onRename = { projectToRename = project },
                                    onDelete = { projectToDelete = project },
                                )
                            }
                        }
                    }
                }

                item(key = "bottom_spacer") {
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }

    projectToRename?.let { target ->
        RenameProjectDialog(
            initialTitle = target.title,
            initialDescription = target.description,
            onDismiss = { projectToRename = null },
            onConfirm = { newTitle, newDesc ->
                viewModel.renameProject(target.id, newTitle, newDesc)
                projectToRename = null
            },
        )
    }

    projectToDelete?.let { target ->
        AlertDialog(
            onDismissRequest = { projectToDelete = null },
            title = { Text("Delete \"${target.title}\"?") },
            text = { Text("This will permanently remove the project code and conversation history.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.deleteProject(target.id)
                        projectToDelete = null
                    },
                ) {
                    Text("Delete", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { projectToDelete = null }) {
                    Text("Cancel")
                }
            },
        )
    }
}

@Composable
private fun PromptComposerHero(
    promptText: String,
    selectedTemplate: TemplateType,
    isBuilding: Boolean,
    buildStatus: String,
    errorMessage: String?,
    onPromptChanged: (String) -> Unit,
    onTemplateSelected: (TemplateType) -> Unit,
    onCraftClick: () -> Unit,
    onDismissError: () -> Unit,
) {
    Card(
        shape = MaterialTheme.shapes.extraLarge,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        border = BorderStroke(
            width = 1.5.dp,
            brush = Brush.linearGradient(
                colors = listOf(
                    CoralPrimary.copy(alpha = 0.65f),
                    IndigoAccent.copy(alpha = 0.55f),
                )
            ),
        ),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Filled.AutoAwesome,
                    contentDescription = null,
                    tint = CoralPrimary,
                    modifier = Modifier.size(20.dp),
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = stringResource(id = R.string.prompt_hero_title),
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = promptText,
                onValueChange = onPromptChanged,
                placeholder = {
                    Text(
                        text = stringResource(id = R.string.prompt_hint),
                        style = MaterialTheme.typography.bodyMedium,
                    )
                },
                minLines = 3,
                maxLines = 6,
                enabled = !isBuilding,
                shape = MaterialTheme.shapes.medium,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.background.copy(alpha = 0.65f),
                    unfocusedContainerColor = MaterialTheme.colorScheme.background.copy(alpha = 0.45f),
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("home_prompt_input"),
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                TemplateType.entries.forEach { template ->
                    FilterChip(
                        selected = selectedTemplate == template,
                        onClick = { onTemplateSelected(template) },
                        enabled = !isBuilding,
                        label = { Text(template.displayName) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.secondaryContainer,
                            selectedLabelColor = MaterialTheme.colorScheme.onSecondaryContainer,
                        ),
                    )
                }
            }

            val focusManager = LocalFocusManager.current
            val keyboardController = LocalSoftwareKeyboardController.current

            AnimatedVisibility(visible = errorMessage != null) {
                Surface(
                    color = MaterialTheme.colorScheme.error.copy(alpha = 0.14f),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.45f)),
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Filled.ErrorOutline,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(18.dp),
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Craft AI did not complete this request",
                                style = MaterialTheme.typography.titleSmall,
                                color = MaterialTheme.colorScheme.error,
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = errorMessage.orEmpty(),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            androidx.compose.material3.OutlinedButton(
                                onClick = {
                                    focusManager.clearFocus()
                                    keyboardController?.hide()
                                    onCraftClick()
                                },
                                modifier = Modifier.heightIn(min = 48.dp),
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Refresh,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp),
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Retry")
                            }
                            TextButton(
                                onClick = onDismissError,
                                modifier = Modifier.heightIn(min = 48.dp),
                            ) {
                                Text("Dismiss")
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Button(
                onClick = {
                    focusManager.clearFocus()
                    keyboardController?.hide()
                    onCraftClick()
                },
                enabled = promptText.isNotBlank() && !isBuilding,
                shape = MaterialTheme.shapes.medium,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("craft_app_button"),
            ) {
                if (isBuilding) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.5.dp,
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = buildStatus.ifBlank { stringResource(id = R.string.building_label) },
                        style = MaterialTheme.typography.labelLarge,
                    )
                } else {
                    Icon(
                        imageVector = Icons.Filled.AutoAwesome,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = stringResource(id = R.string.build_cta),
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}

@Composable
private fun CuratedTemplateCard(
    template: DesignTemplate,
    enabled: Boolean,
    onOpenLiveApp: () -> Unit,
    onUsePrompt: () -> Unit,
) {
    Surface(
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surfaceContainer,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier
            .width(292.dp)
            .testTag("template_card_${template.id}"),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = MaterialTheme.colorScheme.secondaryContainer,
                ) {
                    Text(
                        text = template.badgeLabel,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSecondaryContainer,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                    )
                }

                // 3-dot palette swatch preview
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    listOf(template.canvasHex, template.surfaceHex, template.accentHex).forEach { hex ->
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(CircleShape)
                                .background(Color(hex))
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = template.name,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = template.shortSummary,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )

            Spacer(modifier = Modifier.height(14.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Button(
                    onClick = onOpenLiveApp,
                    enabled = enabled,
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 10.dp),
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 48.dp)
                        .testTag("open_template_${template.id}"),
                ) {
                    Text("Open App", style = MaterialTheme.typography.labelLarge)
                }
                androidx.compose.material3.OutlinedButton(
                    onClick = onUsePrompt,
                    enabled = enabled,
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 10.dp),
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier
                        .heightIn(min = 48.dp)
                        .testTag("prompt_template_${template.id}"),
                ) {
                    Text("Prompt", style = MaterialTheme.typography.labelLarge)
                }
            }
        }
    }
}

@Composable
private fun ProjectCard(
    project: AppProject,
    onOpen: () -> Unit,
    onToggleStar: () -> Unit,
    onRename: () -> Unit,
    onDelete: () -> Unit,
) {
    var showMenu by remember { mutableStateOf(false) }
    val dateText = remember(project.updatedAtMillis) {
        SimpleDateFormat("MMM d, HH:mm", Locale.getDefault()).format(Date(project.updatedAtMillis))
    }
    val template = TemplateType.fromWire(project.templateType)

    Card(
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier
            .fillMaxWidth()
            .clip(MaterialTheme.shapes.large)
            .clickable(onClick = onOpen)
            .testTag("project_card_${project.id}"),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f),
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.primaryContainer,
                    ) {
                        Text(
                            text = template.displayName,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceContainerHigh,
                    ) {
                        Text(
                            text = "v${project.version}",
                            fontFamily = JetBrainsMonoFamily,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp),
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onToggleStar) {
                        Icon(
                            imageVector = if (project.isStarred) Icons.Filled.Star else Icons.Outlined.StarBorder,
                            contentDescription = if (project.isStarred) "Unstar project" else "Star project",
                            tint = if (project.isStarred) AmberSpark else MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Box {
                        IconButton(onClick = { showMenu = true }) {
                            Icon(
                                imageVector = Icons.Filled.MoreVert,
                                contentDescription = "Project options",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false },
                        ) {
                            DropdownMenuItem(
                                text = { Text(stringResource(id = R.string.rename_project)) },
                                leadingIcon = { Icon(Icons.Filled.Edit, contentDescription = null) },
                                onClick = {
                                    showMenu = false
                                    onRename()
                                },
                            )
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        text = stringResource(id = R.string.delete_project),
                                        color = MaterialTheme.colorScheme.error,
                                    )
                                },
                                leadingIcon = {
                                    Icon(
                                        Icons.Filled.Delete,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.error,
                                    )
                                },
                                onClick = {
                                    showMenu = false
                                    onDelete()
                                },
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = project.title,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            if (project.description.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = project.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "Updated $dateText",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.78f),
            )
        }
    }
}

@Composable
private fun EmptyProjectsCard(isFiltered: Boolean) {
    Surface(
        shape = MaterialTheme.shapes.extraLarge,
        color = MaterialTheme.colorScheme.surfaceContainer,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Image(
                painter = painterResource(id = R.drawable.img_empty_canvas),
                contentDescription = "Empty Craftable canvas illustration",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
                    .clip(MaterialTheme.shapes.large),
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = if (isFiltered) "No matching projects" else stringResource(id = R.string.empty_projects_title),
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = if (isFiltered) {
                    "Try clearing your search or star filter."
                } else {
                    stringResource(id = R.string.empty_projects_subtitle)
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
fun RenameProjectDialog(
    initialTitle: String,
    initialDescription: String,
    onDismiss: () -> Unit,
    onConfirm: (title: String, description: String) -> Unit,
) {
    var title by remember { mutableStateOf(initialTitle) }
    var description by remember { mutableStateOf(initialDescription) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(id = R.string.rename_project)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Project name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(title, description) },
                enabled = title.isNotBlank(),
            ) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
    )
}
