package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [ProjectEntity::class, MessageEntity::class],
    version = 1,
    exportSchema = false,
)
abstract class CraftableDatabase : RoomDatabase() {

    abstract fun craftableDao(): CraftableDao

    companion object {
        @Volatile
        private var INSTANCE: CraftableDatabase? = null

        fun getInstance(context: Context): CraftableDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    CraftableDatabase::class.java,
                    "craftable_studio.db",
                ).build().also { INSTANCE = it }
            }
        }
    }
}
