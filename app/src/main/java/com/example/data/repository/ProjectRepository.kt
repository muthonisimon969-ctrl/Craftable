package com.example.data.repository

import android.content.Context
import com.example.data.local.CraftableDao
import com.example.data.local.CraftableDatabase
import com.example.data.local.MessageEntity
import com.example.data.local.ProjectEntity
import com.example.data.local.toDomain
import com.example.data.model.AppProject
import com.example.data.model.GeneratedAppBundle
import com.example.data.model.ProjectMessage
import com.example.data.model.TemplateType
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.UUID

class ProjectRepository(private val dao: CraftableDao) {

    constructor(context: Context) : this(
        CraftableDatabase.getInstance(context).craftableDao()
    )

    fun observeProjects(): Flow<List<AppProject>> =
        dao.observeProjects().map { list -> list.map { it.toDomain() } }

    fun observeProject(projectId: String): Flow<AppProject?> =
        dao.observeProject(projectId).map { it?.toDomain() }

    fun observeMessages(projectId: String): Flow<List<ProjectMessage>> =
        dao.observeMessages(projectId).map { list -> list.map { it.toDomain() } }

    suspend fun getProject(projectId: String): Result<AppProject?> = try {
        Result.success(dao.getProject(projectId)?.toDomain())
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun createProject(
        prompt: String,
        templateType: TemplateType,
        bundle: GeneratedAppBundle,
    ): Result<String> {
        val projectId = UUID.randomUUID().toString()
        val now = System.currentTimeMillis()
        val projectEntity = ProjectEntity(
            id = projectId,
            title = bundle.projectTitle.trim().ifBlank { "Untitled Craft" }.take(120),
            description = bundle.description.trim().take(500),
            initialPrompt = prompt.trim().take(2000),
            templateType = templateType.wireValue,
            isStarred = false,
            version = 1L,
            htmlCode = bundle.htmlCode,
            cssCode = bundle.cssCode,
            jsCode = bundle.jsCode,
            createdAtMillis = now,
            updatedAtMillis = now,
        )
        val messages = listOf(
            MessageEntity(
                id = UUID.randomUUID().toString(),
                projectId = projectId,
                role = ProjectMessage.ROLE_USER,
                content = prompt.trim(),
                filesChangedSerialized = "",
                versionTag = 1L,
                createdAtMillis = now,
            ),
            MessageEntity(
                id = UUID.randomUUID().toString(),
                projectId = projectId,
                role = ProjectMessage.ROLE_ASSISTANT,
                content = bundle.summary.trim().ifBlank { "Generated initial app." },
                filesChangedSerialized = bundle.changedFiles.joinToString("|"),
                versionTag = 1L,
                createdAtMillis = now + 1L,
            ),
        )
        return try {
            dao.createProjectWithMessages(projectEntity, messages)
            Result.success(projectId)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun applyIterationTurn(
        projectId: String,
        prompt: String,
        currentVersion: Long,
        bundle: GeneratedAppBundle,
    ): Result<Long> {
        val nextVersion = currentVersion + 1L
        val now = System.currentTimeMillis()
        val messages = listOf(
            MessageEntity(
                id = UUID.randomUUID().toString(),
                projectId = projectId,
                role = ProjectMessage.ROLE_USER,
                content = prompt.trim(),
                filesChangedSerialized = "",
                versionTag = nextVersion,
                createdAtMillis = now,
            ),
            MessageEntity(
                id = UUID.randomUUID().toString(),
                projectId = projectId,
                role = ProjectMessage.ROLE_ASSISTANT,
                content = bundle.summary.trim().ifBlank { "Updated application." },
                filesChangedSerialized = bundle.changedFiles.joinToString("|"),
                versionTag = nextVersion,
                createdAtMillis = now + 1L,
            ),
        )
        return try {
            dao.applyIterationTurn(
                projectId = projectId,
                title = bundle.projectTitle.trim().ifBlank { "Untitled Craft" }.take(120),
                description = bundle.description.trim().take(500),
                version = nextVersion,
                htmlCode = bundle.htmlCode,
                cssCode = bundle.cssCode,
                jsCode = bundle.jsCode,
                updatedAtMillis = now,
                messages = messages,
            )
            Result.success(nextVersion)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateProjectCodeManual(
        projectId: String,
        currentVersion: Long,
        htmlCode: String,
        cssCode: String,
        jsCode: String,
    ): Result<Unit> = try {
        val current = dao.getProject(projectId)
        if (current != null) {
            dao.updateProjectCodeAndMeta(
                projectId = projectId,
                title = current.title,
                description = current.description,
                version = currentVersion + 1L,
                htmlCode = htmlCode,
                cssCode = cssCode,
                jsCode = jsCode,
                updatedAtMillis = System.currentTimeMillis(),
            )
        }
        Result.success(Unit)
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun toggleStarred(projectId: String, starred: Boolean): Result<Unit> = try {
        dao.updateStarred(projectId, starred, System.currentTimeMillis())
        Result.success(Unit)
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun renameProject(
        projectId: String,
        newTitle: String,
        newDescription: String,
    ): Result<Unit> = try {
        dao.renameProject(
            projectId = projectId,
            title = newTitle.trim().ifBlank { "Untitled Craft" }.take(120),
            description = newDescription.trim().take(500),
            updatedAtMillis = System.currentTimeMillis(),
        )
        Result.success(Unit)
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun deleteProject(projectId: String): Result<Unit> = try {
        dao.deleteProject(projectId)
        Result.success(Unit)
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        Result.failure(e)
    }
}
