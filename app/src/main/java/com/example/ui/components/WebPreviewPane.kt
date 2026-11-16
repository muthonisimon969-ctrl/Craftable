package com.example.ui.components

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FullscreenExit
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
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
    isFullscreen: Boolean,
    consoleLogs: List<ConsoleEntry>,
    showConsoleSheet: Boolean,
    onToggleFullscreen: () -> Unit,
    onDismissConsole: () -> Unit,
    onClearConsole: () -> Unit,
    onConsoleMessage: (level: String, message: String) -> Unit,
    modifier: Modifier = Modifier,
) {
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

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
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
                    // Respect <meta name="viewport" content="width=device-width, initial-scale=1.0"> at native 1:1 scale without overview zoom-out
                    settings.useWideViewPort = true
                    settings.loadWithOverviewMode = false
                    settings.textZoom = 110
                    settings.builtInZoomControls = true
                    settings.displayZoomControls = false
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

        if (isFullscreen) {
            FilledTonalButton(
                onClick = onToggleFullscreen,
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp),
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp)
                    .heightIn(min = 48.dp)
                    .testTag("exit_fullscreen_button"),
            ) {
                Icon(
                    imageVector = Icons.Filled.FullscreenExit,
                    contentDescription = "Exit fullscreen preview",
                    modifier = Modifier.size(20.dp),
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("Exit Fullscreen", style = MaterialTheme.typography.labelLarge)
            }
        }
    }

    LaunchedEffect(assembledHtml, reloadNonce) {
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
