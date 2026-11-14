package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.theme.AmberSpark
import com.example.ui.theme.CoralPrimary
import com.example.ui.theme.IndigoAccent
import com.example.ui.theme.JetBrainsMonoFamily
import com.example.ui.viewmodel.CodeFileTab

@Composable
fun CodeExplorerPane(
    selectedFile: CodeFileTab,
    htmlCode: String,
    cssCode: String,
    jsCode: String,
    hasUnsavedChanges: Boolean,
    isSaving: Boolean,
    onSelectFile: (CodeFileTab) -> Unit,
    onCodeChanged: (String) -> Unit,
    onSaveAndRun: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val activeCode = when (selectedFile) {
        CodeFileTab.INDEX_HTML -> htmlCode
        CodeFileTab.STYLES_CSS -> cssCode
        CodeFileTab.APP_JS -> jsCode
    }
    val lineCount = activeCode.count { it == '\n' } + 1

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 12.dp, vertical = 8.dp),
    ) {
        // File tabs + action bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CodeFileTab.entries.forEach { fileTab ->
                val dotColor = when (fileTab) {
                    CodeFileTab.INDEX_HTML -> CoralPrimary
                    CodeFileTab.STYLES_CSS -> IndigoAccent
                    CodeFileTab.APP_JS -> AmberSpark
                }
                val isSelected = fileTab == selectedFile
                FilterChip(
                    selected = isSelected,
                    onClick = { onSelectFile(fileTab) },
                    label = {
                        Text(
                            text = fileTab.filename,
                            fontFamily = JetBrainsMonoFamily,
                            style = MaterialTheme.typography.labelSmall,
                        )
                    },
                    leadingIcon = {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(dotColor)
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.surfaceContainerHigh,
                        selectedLabelColor = MaterialTheme.colorScheme.onSurface,
                    ),
                    modifier = Modifier.testTag("code_tab_${fileTab.name.lowercase()}"),
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Editor surface
        Surface(
            shape = MaterialTheme.shapes.medium,
            color = MaterialTheme.colorScheme.surfaceContainer,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Toolbar inside editor
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceContainerHigh)
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(
                        text = "${selectedFile.filename} • $lineCount lines",
                        fontFamily = JetBrainsMonoFamily,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                clipboard.setPrimaryClip(
                                    ClipData.newPlainText(selectedFile.filename, activeCode)
                                )
                                Toast.makeText(
                                    context,
                                    "Copied ${selectedFile.filename}",
                                    Toast.LENGTH_SHORT
                                ).show()
                            },
                            modifier = Modifier.testTag("copy_code_button"),
                        ) {
                            Icon(
                                imageVector = Icons.Filled.ContentCopy,
                                contentDescription = "Copy file source code",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp),
                            )
                        }

                        if (hasUnsavedChanges) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Button(
                                onClick = onSaveAndRun,
                                enabled = !isSaving,
                                shape = MaterialTheme.shapes.small,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                ),
                                modifier = Modifier
                                    .height(36.dp)
                                    .testTag("save_run_code_button"),
                            ) {
                                if (isSaving) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(14.dp),
                                        strokeWidth = 2.dp,
                                        color = MaterialTheme.colorScheme.onPrimary,
                                    )
                                } else {
                                    Icon(
                                        imageVector = Icons.Filled.PlayArrow,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp),
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = stringResource(id = R.string.apply_code),
                                        style = MaterialTheme.typography.labelMedium,
                                    )
                                }
                            }
                        }
                    }
                }

                // Editable Monospace Code Area
                val verticalScroll = rememberScrollState()
                val horizontalScroll = rememberScrollState()
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(verticalScroll)
                        .padding(12.dp),
                ) {
                    // Line number gutter
                    Column(
                        modifier = Modifier.padding(end = 12.dp),
                        horizontalAlignment = Alignment.End,
                    ) {
                        for (line in 1..lineCount) {
                            Text(
                                text = "$line",
                                fontFamily = JetBrainsMonoFamily,
                                fontSize = 12.sp,
                                lineHeight = 19.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.55f),
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .horizontalScroll(horizontalScroll),
                    ) {
                        BasicTextField(
                            value = activeCode,
                            onValueChange = onCodeChanged,
                            textStyle = TextStyle(
                                fontFamily = JetBrainsMonoFamily,
                                fontSize = 12.sp,
                                lineHeight = 19.sp,
                                color = MaterialTheme.colorScheme.onSurface,
                            ),
                            cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("code_editor_field"),
                        )
                    }
                }
            }
        }
    }
}
