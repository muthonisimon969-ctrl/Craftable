package com.example

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class MainActivityLaunchTest {

    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun launchApp_showsPromptStudioDirectlyWithNoSignInGate() {
        composeRule.onNodeWithText("What do you want to craft?").assertIsDisplayed()
        composeRule.onNodeWithTag("home_prompt_input").assertIsDisplayed()
        composeRule.onNodeWithTag("craft_app_button").assertIsDisplayed()
        composeRule.onNodeWithText("Sign in with Google").assertDoesNotExist()
        composeRule.onNodeWithText("Add Google Account in Device Settings").assertDoesNotExist()
    }
}
