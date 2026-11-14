package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val StudioDarkColorScheme = darkColorScheme(
    primary = CoralPrimary,
    onPrimary = Color.White,
    primaryContainer = CoralContainerDark,
    onPrimaryContainer = CoralGlow,
    secondary = IndigoSoft,
    onSecondary = Color.White,
    secondaryContainer = IndigoContainerDark,
    onSecondaryContainer = Color(0xFFD6DAFF),
    tertiary = AmberSpark,
    onTertiary = Color(0xFF1A1100),
    background = ObsidianBg,
    onBackground = StudioTextPrimary,
    surface = ObsidianSurface,
    onSurface = StudioTextPrimary,
    surfaceVariant = ObsidianSurfaceHigh,
    onSurfaceVariant = StudioTextSecondary,
    surfaceContainerLow = ObsidianSurface,
    surfaceContainer = ObsidianSurfaceHigh,
    surfaceContainerHigh = ObsidianSurfaceHighest,
    outline = ObsidianBorder,
    outlineVariant = ObsidianBorder.copy(alpha = 0.6f),
    error = RoseError,
    onError = Color.White,
)

private val StudioLightColorScheme = lightColorScheme(
    primary = CoralPrimary,
    onPrimary = Color.White,
    primaryContainer = CoralContainerLight,
    onPrimaryContainer = Color(0xFF7A1717),
    secondary = IndigoAccent,
    onSecondary = Color.White,
    secondaryContainer = IndigoContainerLight,
    onSecondaryContainer = Color(0xFF1B1E6E),
    tertiary = AmberSpark,
    onTertiary = Color(0xFF2B1700),
    background = AlabasterBg,
    onBackground = LightTextPrimary,
    surface = AlabasterSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = AlabasterSurfaceLow,
    onSurfaceVariant = LightTextSecondary,
    surfaceContainerLow = AlabasterSurfaceLow,
    surfaceContainer = AlabasterSurface,
    surfaceContainerHigh = AlabasterSurfaceHigh,
    outline = AlabasterBorder,
    outlineVariant = AlabasterBorder.copy(alpha = 0.7f),
    error = RoseError,
    onError = Color.White,
)

val CraftableShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(22.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

@Composable
fun CraftableTheme(
    darkTheme: Boolean = true,
    useSystemTheme: Boolean = false,
    content: @Composable () -> Unit,
) {
    val isDark = if (useSystemTheme) isSystemInDarkTheme() else darkTheme
    val colorScheme = if (isDark) StudioDarkColorScheme else StudioLightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = CraftableTypography,
        shapes = CraftableShapes,
        content = content,
    )
}
