package com.example.data.repository

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.CraftableDatabase
import com.example.data.model.GeneratedAppBundle
import com.example.data.model.TemplateType
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
class ProjectRepositoryTest {

    private lateinit var database: CraftableDatabase
    private lateinit var repository: ProjectRepository

    @Before
    fun setup() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(context, CraftableDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        repository = ProjectRepository(database.craftableDao())
    }

    @After
    fun teardown() {
        database.close()
    }

    private fun sampleBundle(title: String = "Focus Pulse") = GeneratedAppBundle(
        projectTitle = title,
        description = "Minimalist Pomodoro workspace",
        summary = "Built Focus Pulse with timer and tasks.",
        htmlCode = "<main><h1>$title</h1></main>",
        cssCode = "body { background: #0f111a; }",
        jsCode = "console.log('ready');",
        changedFiles = listOf("index.html", "styles.css", "app.js"),
        followUpSuggestions = listOf("Add dark mode", "Add audio", "Add stats"),
    )

    @Test
    fun createIterateStarAndDeleteProject_worksEndToEnd() = runBlocking {
        val projectId = repository.createProject(
            prompt = "Build a Pomodoro app",
            templateType = TemplateType.WEB_APP,
            bundle = sampleBundle(),
        ).getOrThrow()

        val projects = repository.observeProjects().first()
        assertEquals(1, projects.size)
        assertEquals("Focus Pulse", projects[0].title)
        assertFalse(projects[0].isStarred)

        val messages = repository.observeMessages(projectId).first()
        assertEquals(2, messages.size)
        assertEquals("user", messages[0].role)
        assertEquals("assistant", messages[1].role)

        repository.toggleStarred(projectId, true).getOrThrow()
        repository.applyIterationTurn(
            projectId = projectId,
            prompt = "Add analytics view",
            currentVersion = 1L,
            bundle = sampleBundle("Focus Pulse v2"),
        ).getOrThrow()

        val updated = repository.getProject(projectId).getOrThrow()
        assertNotNull(updated)
        assertTrue(updated!!.isStarred)
        assertEquals(2L, updated.version)
        assertEquals("Focus Pulse v2", updated.title)
        assertEquals(4, repository.observeMessages(projectId).first().size)

        repository.deleteProject(projectId).getOrThrow()
        assertNull(repository.getProject(projectId).getOrThrow())
        assertTrue(repository.observeMessages(projectId).first().isEmpty())
    }
}
