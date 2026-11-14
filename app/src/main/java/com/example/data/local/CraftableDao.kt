package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface CraftableDao {

    @Query("SELECT * FROM projects ORDER BY updatedAtMillis DESC")
    fun observeProjects(): Flow<List<ProjectEntity>>

    @Query("SELECT * FROM projects WHERE id = :projectId LIMIT 1")
    fun observeProject(projectId: String): Flow<ProjectEntity?>

    @Query("SELECT * FROM projects WHERE id = :projectId LIMIT 1")
    suspend fun getProject(projectId: String): ProjectEntity?

    @Query("SELECT * FROM project_messages WHERE projectId = :projectId ORDER BY createdAtMillis ASC, versionTag ASC")
    fun observeMessages(projectId: String): Flow<List<MessageEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertProject(project: ProjectEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessages(messages: List<MessageEntity>)

    @Transaction
    suspend fun createProjectWithMessages(
        project: ProjectEntity,
        messages: List<MessageEntity>,
    ) {
        upsertProject(project)
        insertMessages(messages)
    }

    @Query(
        """
        UPDATE projects
        SET title = :title,
            description = :description,
            version = :version,
            htmlCode = :htmlCode,
            cssCode = :cssCode,
            jsCode = :jsCode,
            updatedAtMillis = :updatedAtMillis
        WHERE id = :projectId
        """
    )
    suspend fun updateProjectCodeAndMeta(
        projectId: String,
        title: String,
        description: String,
        version: Long,
        htmlCode: String,
        cssCode: String,
        jsCode: String,
        updatedAtMillis: Long,
    )

    @Transaction
    suspend fun applyIterationTurn(
        projectId: String,
        title: String,
        description: String,
        version: Long,
        htmlCode: String,
        cssCode: String,
        jsCode: String,
        updatedAtMillis: Long,
        messages: List<MessageEntity>,
    ) {
        updateProjectCodeAndMeta(
            projectId = projectId,
            title = title,
            description = description,
            version = version,
            htmlCode = htmlCode,
            cssCode = cssCode,
            jsCode = jsCode,
            updatedAtMillis = updatedAtMillis,
        )
        insertMessages(messages)
    }

    @Query("UPDATE projects SET isStarred = :starred, updatedAtMillis = :updatedAtMillis WHERE id = :projectId")
    suspend fun updateStarred(projectId: String, starred: Boolean, updatedAtMillis: Long)

    @Query("UPDATE projects SET title = :title, description = :description, updatedAtMillis = :updatedAtMillis WHERE id = :projectId")
    suspend fun renameProject(projectId: String, title: String, description: String, updatedAtMillis: Long)

    @Query("DELETE FROM projects WHERE id = :projectId")
    suspend fun deleteProject(projectId: String)
}
