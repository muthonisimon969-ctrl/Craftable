package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.data.ai.AppBuilderAiService
import com.example.data.firebase.configureAppCheck
import com.example.data.repository.ProjectRepository
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.WorkspaceScreen
import com.example.ui.theme.CraftableTheme
import com.example.ui.viewmodel.HomeViewModel
import com.example.ui.viewmodel.WorkspaceViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Configure Firebase App Check with launch intent before any UI or ViewModels
        configureAppCheck(this, intent)

        enableEdgeToEdge()
        setContent {
            var isDarkTheme by rememberSaveable { mutableStateOf(true) }
            CraftableTheme(darkTheme = isDarkTheme) {
                AppNavigation(
                    isDarkTheme = isDarkTheme,
                    onToggleTheme = { isDarkTheme = !isDarkTheme },
                )
            }
        }
    }
}

private const val ROUTE_HOME = "home"
private const val ROUTE_WORKSPACE = "workspace/{projectId}"

@Composable
fun AppNavigation(
    isDarkTheme: Boolean,
    onToggleTheme: () -> Unit,
) {
    val navController = rememberNavController()
    val aiService = remember { AppBuilderAiService() }

    NavHost(
        navController = navController,
        startDestination = ROUTE_HOME,
    ) {
        composable(ROUTE_HOME) {
            val homeViewModel: HomeViewModel = viewModel(
                factory = viewModelFactory {
                    initializer {
                        val app = checkNotNull(this[APPLICATION_KEY]) {
                            "APPLICATION_KEY missing from CreationExtras"
                        }
                        HomeViewModel(
                            repository = ProjectRepository(app),
                            aiService = aiService,
                        )
                    }
                },
            )

            HomeScreen(
                viewModel = homeViewModel,
                isDarkTheme = isDarkTheme,
                onToggleTheme = onToggleTheme,
                onOpenProject = { projectId ->
                    navController.navigate("workspace/$projectId")
                },
            )
        }

        composable(
            route = ROUTE_WORKSPACE,
            arguments = listOf(
                navArgument("projectId") { type = NavType.StringType }
            ),
        ) { backStackEntry ->
            val projectId = backStackEntry.arguments?.getString("projectId").orEmpty()
            val workspaceViewModel: WorkspaceViewModel = viewModel(
                key = "workspace_$projectId",
                factory = viewModelFactory {
                    initializer {
                        val app = checkNotNull(this[APPLICATION_KEY]) {
                            "APPLICATION_KEY missing from CreationExtras"
                        }
                        WorkspaceViewModel(
                            repository = ProjectRepository(app),
                            aiService = aiService,
                            projectId = projectId,
                        )
                    }
                },
            )

            WorkspaceScreen(
                viewModel = workspaceViewModel,
                onNavigateBack = { navController.popBackStack() },
            )
        }
    }
}
