package com.example.ui.components

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DesktopWindows
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.AmberSpark
import com.example.ui.theme.EmeraldLive
import com.example.ui.theme.JetBrainsMonoFamily
import com.example.ui.theme.RoseError
import com.example.ui.viewmodel.ConsoleEntry
import com.example.util.WebBundleAssembler
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebPreviewPane(
    title: String,
    htmlCode: String,
    cssCode: String,
    jsCode: String,
    reloadNonce: Int,
    isMobileViewport: Boolean,
    consoleLogs: List<ConsoleEntry>,
    showConsoleSheet: Boolean,
    onToggleViewport: () -> Unit,
    onReload: () -> Unit,
    onOpenConsole: () -> Unit,
    onDismissConsole: () -> Unit,
    onClearConsole: () -> Unit,
    onConsoleMessage: (level: String, message: String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val assembledHtml = remember(title, htmlCode, cssCode, jsCode, reloadNonce) {
        WebBundleAssembler.assemblePreviewDocument(
            title = title,
            htmlCode = htmlCode,
            cssCode = cssCode,
            jsCode = jsCode,
        )
    }

    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var lastLoadedSignature by remember { mutableStateOf("") }

    val jsBridge = remember {
        object {
            private val mainScope = MainScope()

            @JavascriptInterface
            fun onConsole(level: String, message: String) {
                mainScope.launch(Dispatchers.Main) {
                    onConsoleMessage(level, message)
                }
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            webViewRef?.apply {
                stopLoading()
                removeJavascriptInterface("CraftableBridge")
                destroy()
            }
            webViewRef = null
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Preview Browser Bar
        Surface(
            color = MaterialTheme.colorScheme.surfaceContainer,
            tonalElevation = 1.dp,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            shape = MaterialTheme.shapes.medium,
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f),
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(EmeraldLive)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "craftable.app/preview",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onToggleViewport,
                        modifier = Modifier.testTag("toggle_viewport_button"),
                    ) {
                        Icon(
                            imageVector = if (isMobileViewport) {
                                Icons.Filled.PhoneAndroid
                            } else {
                                Icons.Filled.DesktopWindows
                            },
                            contentDescription = if (isMobileViewport) {
                                "Switch to full width preview"
                            } else {
                                "Switch to mobile phone frame"
                            },
                            tint = MaterialTheme.colorScheme.onSurface,
                        )
                    }

                    IconButton(
                        onClick = onReload,
                        modifier = Modifier.testTag("reload_preview_button"),
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Refresh,
                            contentDescription = "Reload live preview",
                            tint = MaterialTheme.colorScheme.onSurface,
                        )
                    }

                    IconButton(
                        onClick = onOpenConsole,
                        modifier = Modifier.testTag("open_console_button"),
                    ) {
                        BadgedBox(
                            badge = {
                                if (consoleLogs.isNotEmpty()) {
                                    Badge(
                                        containerColor = if (consoleLogs.any { it.level == "ERROR" }) {
                                            RoseError
                                        } else {
                                            MaterialTheme.colorScheme.primary
                                        }
                                    ) {
                                        Text("${consoleLogs.size}")
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Terminal,
                                contentDescription = "View console logs",
                                tint = MaterialTheme.colorScheme.onSurface,
                            )
                        }
                    }
                }
            }
        }

        // Preview Canvas Frame
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 12.dp)
                .padding(bottom = 8.dp),
            contentAlignment = Alignment.Center,
        ) {
            val frameModifier = if (isMobileViewport) {
                Modifier
                    .widthIn(max = 410.dp)
                    .fillMaxSize()
            } else {
                Modifier.fillMaxSize()
            }

            Surface(
                shape = RoundedCornerShape(if (isMobileViewport) 26.dp else 14.dp),
                border = BorderStroke(
                    width = if (isMobileViewport) 2.dp else 1.dp,
                    color = MaterialTheme.colorScheme.outline,
                ),
                shadowElevation = 6.dp,
                color = MaterialTheme.colorScheme.surface,
                modifier = frameModifier,
            ) {
                AndroidView(
                    factory = { ctx ->
                        WebView(ctx).apply {
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT,
                            )
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            settings.useWideViewPort = true
                            settings.loadWithOverviewMode = true
                            webViewClient = WebViewClient()
                            webChromeClient = WebChromeClient()
                            addJavascriptInterface(jsBridge, "CraftableBridge")
                            webViewRef = this
                        }
                    },
                    update = { webView ->
                        val sig = "$reloadNonce:${assembledHtml.hashCode()}"
                        if (sig != lastLoadedSignature) {
                            lastLoadedSignature = sig
                            webView.loadDataWithBaseURL(
                                "https://craftable.app/",
                                assembledHtml,
                                "text/html",
                                "UTF-8",
                                null,
                            )
                        }
                    },
                    modifier = Modifier.fillMaxSize(),
                )
            }
        }
    }

    LaunchedEffect(reloadNonce) {
        val sig = "$reloadNonce:${assembledHtml.hashCode()}"
        webViewRef?.let { wv ->
            if (sig != lastLoadedSignature) {
                lastLoadedSignature = sig
                wv.loadDataWithBaseURL(
                    "https://craftable.app/",
                    assembledHtml,
                    "text/html",
                    "UTF-8",
                    null,
                )
            }
        }
    }

    if (showConsoleSheet) {
        ModalBottomSheet(
            onDismissRequest = onDismissConsole,
            containerColor = MaterialTheme.colorScheme.surfaceContainer,
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .padding(bottom = 28.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = "Preview Console",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                    TextButton(onClick = onClearConsole) {
                        Text("Clear")
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))

                if (consoleLogs.isEmpty()) {
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceContainerHigh,
                        shape = MaterialTheme.shapes.medium,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(
                            text = "No console output yet. Interact with the live preview to see logs or runtime errors.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(16.dp),
                        )
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(260.dp),
                    ) {
                        items(consoleLogs) { entry ->
                            val badgeColor = when (entry.level) {
                                "ERROR" -> RoseError
                                "WARN" -> AmberSpark
                                else -> EmeraldLive
                            }
                            Surface(
                                color = MaterialTheme.colorScheme.surfaceContainerHigh,
                                shape = MaterialTheme.shapes.small,
                                modifier = Modifier.fillMaxWidth(),
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.Top,
                                ) {
                                    Text(
                                        text = entry.level,
                                        fontFamily = JetBrainsMonoFamily,
                                        style = MaterialTheme.typography.labelSmall,
                                        color = badgeColor,
                                        modifier = Modifier.width(48.dp),
                                    )
                                    Text(
                                        text = entry.message,
                                        fontFamily = JetBrainsMonoFamily,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
