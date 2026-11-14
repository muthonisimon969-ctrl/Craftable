package com.example.data.local

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.data.model.AppProject
import com.example.data.model.ProjectMessage

@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val initialPrompt: String,
    val templateType: String,
    val isStarred: Boolean,
    val version: Long,
    val htmlCode: String,
    val cssCode: String,
    val jsCode: String,
    val createdAtMillis: Long,
    val updatedAtMillis: Long,
)

@Entity(
    tableName = "project_messages",
    foreignKeys = [
        ForeignKey(
            entity = ProjectEntity::class,
            parentColumns = ["id"],
            childColumns = ["projectId"],
            onDelete = ForeignKey.CASCADE,
        )
    ],
    indices = [Index(value = ["projectId"])],
)
data class MessageEntity(
    @PrimaryKey val id: String,
    val projectId: String,
    val role: String,
    val content: String,
    val filesChangedSerialized: String,
    val versionTag: Long,
    val createdAtMillis: Long,
)

fun ProjectEntity.toDomain(): AppProject = AppProject(
    id = id,
    title = title,
    description = description,
    initialPrompt = initialPrompt,
    templateType = templateType,
    isStarred = isStarred,
    version = version,
    htmlCode = htmlCode,
    cssCode = cssCode,
    jsCode = jsCode,
    createdAtMillis = createdAtMillis,
    updatedAtMillis = updatedAtMillis,
)

fun MessageEntity.toDomain(): ProjectMessage = ProjectMessage(
    id = id,
    projectId = projectId,
    role = role,
    content = content,
    filesChanged = filesChangedSerialized
        .split("|")
        .map { it.trim() }
        .filter { it.isNotEmpty() },
    versionTag = versionTag,
    createdAtMillis = createdAtMillis,
)
