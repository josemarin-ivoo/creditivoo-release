package com.cuota

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SecureStorage(private val context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveSecureString(key: String, value: String) {
        encryptedPrefs.edit().putString(key, value).apply()
    }

    fun getSecureString(key: String): String? {
        return encryptedPrefs.getString(key, null)
    }

    fun clearSecureData() {
        encryptedPrefs.edit().clear().apply()
    }

    companion object {
        const val KEY_UNLOCK_CODE = "secure_unlock_code"
        const val KEY_MASTER_UNLOCK_CODE = "secure_master_unlock_code"
        const val KEY_TOKEN = "secure_token"
        const val KEY_DEVICE_ID = "secure_device_id"
        const val KEY_ADMIN_REMOVAL_PIN = "secure_admin_removal_pin"
    }
} 