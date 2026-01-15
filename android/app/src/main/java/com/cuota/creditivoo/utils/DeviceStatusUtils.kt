package com.cuota.utils

import android.content.Context
import android.util.Log
import com.cuota.SecureStorage
import com.cuota.api.ApiClient
import com.cuota.models.DeviceStatusUpdate
import com.cuota.models.LocationData
import com.cuota.utils.SystemInfoUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

object DeviceStatusUtils {
    private const val TAG = "DeviceStatusUtils"
    
    /**
     * Obtiene el estado interno actual del dispositivo (LOCKED/UNLOCKED)
     * Basado en el estado de LockTask y las preferencias locales
     */
    fun getCurrentDeviceState(context: Context): String {
        return try {
            // Verificar si está en modo LockTask (kiosko)
            val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
            val isInLockTaskMode = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                activityManager.lockTaskModeState != android.app.ActivityManager.LOCK_TASK_MODE_NONE
            } else false
            
            // Verificar también las preferencias locales como respaldo
            val kioskPrefs = context.getSharedPreferences("kiosk_prefs", Context.MODE_PRIVATE)
            val isKioskModeStored = kioskPrefs.getBoolean("isInKioskMode", false)
            
            // El dispositivo está bloqueado si está en LockTask mode O si está marcado como kiosko en prefs
            val isLocked = isInLockTaskMode || isKioskModeStored
            
            val currentState = if (isLocked) "LOCKED" else "UNLOCKED"
            Log.d(TAG, "Estado interno del dispositivo: $currentState (LockTask: $isInLockTaskMode, KioskPrefs: $isKioskModeStored)")
            currentState
        } catch (e: Exception) {
            Log.e(TAG, "Error obteniendo estado interno del dispositivo: ${e.message}")
            "UNKNOWN"
        }
    }

    // Función existente: NO TOCAR
    suspend fun updateDeviceStatus(
        context: Context,
        status: String = "ACTIVE",
        fcmToken: String? = null
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            val secureStorage = SecureStorage(context)
            val deviceId = secureStorage.getSecureString(SecureStorage.KEY_DEVICE_ID)
            val token = secureStorage.getSecureString(SecureStorage.KEY_TOKEN)

            if (deviceId == null || token == null) {
                Log.e(TAG, "No se encontró deviceId o token en almacenamiento seguro")
                return@withContext false
            }

            // Obtener ubicación actual usando callback con timeout de fallback
            var locationCallbackExecuted = false
            
            try {
                SystemInfoUtils.getCurrentLocation(context) { location: LocationData? ->
                    locationCallbackExecuted = true
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val bearerToken = "Bearer $token"
                            val currentState = getCurrentDeviceState(context)
                            val statusUpdate = DeviceStatusUpdate(
                                lastUnlockTime = System.currentTimeMillis(),
                                fcmToken = fcmToken,
                                status = status,
                                currentState = currentState,
                                location = location
                            )

                            val response = ApiClient.apiService.updateDeviceStatus(bearerToken, deviceId, statusUpdate)

                            if (response.isSuccessful) {
                                val backendResponse = response.body()
                                val backendStatus = backendResponse?.status ?: "UNKNOWN"
                            } else {
                                Log.e(TAG, "Error al actualizar estado del dispositivo: ${response.code()}")
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Error al actualizar estado del dispositivo con ubicación: ${e.message}")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error obteniendo ubicación para updateDeviceStatus: ${e.message}")
                // Fallback inmediato si hay error obteniendo ubicación
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        val bearerToken = "Bearer $token"
                        val statusUpdate = DeviceStatusUpdate(
                            lastUnlockTime = System.currentTimeMillis(),
                            fcmToken = fcmToken,
                            status = status,
                            location = null
                        )

                        val response = ApiClient.apiService.updateDeviceStatus(bearerToken, deviceId, statusUpdate)

                        if (response.isSuccessful) {
                            val backendResponse = response.body()
                            val backendStatus = backendResponse?.status ?: "UNKNOWN"
                        } else {
                            Log.e(TAG, "Error al actualizar estado del dispositivo error fallback: ${response.code()}")
                        }
                    } catch (fallbackError: Exception) {
                        Log.e(TAG, "Error al actualizar estado del dispositivo error fallback: ${fallbackError.message}")
                    }
                }
            }
            
            // Fallback: Si la ubicación no responde en 5 segundos, enviar update sin ubicación
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                if (!locationCallbackExecuted) {
                    Log.w(TAG, "Timeout de ubicación, enviando update sin ubicación")
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val bearerToken = "Bearer $token"
                            val statusUpdate = DeviceStatusUpdate(
                                lastUnlockTime = System.currentTimeMillis(),
                                fcmToken = fcmToken,
                                status = status,
                                location = null
                            )

                            val response = ApiClient.apiService.updateDeviceStatus(bearerToken, deviceId, statusUpdate)

                            if (response.isSuccessful) {
                                Log.d(TAG, "Estado del dispositivo actualizado exitosamente sin ubicación (fallback)")
                            } else {
                                Log.e(TAG, "Error al actualizar estado del dispositivo fallback: ${response.code()}")
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Error al actualizar estado del dispositivo fallback: ${e.message}")
                        }
                    }
                }
            }, 3000L) // 3 segundos timeout para fallback
            
            // Retornar true inmediatamente ya que la ubicación se maneja en callback
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error al actualizar estado del dispositivo", e)
            false
        }
    }

    suspend fun updateLastUnlockTimeOnly(context: Context): Boolean = withContext(Dispatchers.IO) {
        try {
            val secureStorage = SecureStorage(context)
            val deviceId = secureStorage.getSecureString(SecureStorage.KEY_DEVICE_ID)
            val token = secureStorage.getSecureString(SecureStorage.KEY_TOKEN)

            if (deviceId == null || token == null) {
                Log.e(TAG, "No se encontró deviceId o token en almacenamiento seguro")
                return@withContext false
            }

            // Obtener ubicación actual usando callback con timeout de fallback
            var locationCallbackExecuted = false
            
            SystemInfoUtils.getCurrentLocation(context) { location: com.cuota.models.LocationData? ->
                locationCallbackExecuted = true
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        val bearerToken = "Bearer $token"
                        val currentState = getCurrentDeviceState(context)
                        val statusUpdate = DeviceStatusUpdate(
                            lastUnlockTime = System.currentTimeMillis(),
                            currentState = currentState,
                            location = location
                        )

                        val response = ApiClient.apiService.updateDeviceStatus(bearerToken, deviceId, statusUpdate)

                        if (response.isSuccessful) {
                            val backendResponse = response.body()
                            val backendStatus = backendResponse?.status ?: "UNKNOWN"
                        } else {
                            Log.e(TAG, "Error al actualizar solo lastUnlockTime: ${response.code()}")
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error al actualizar solo lastUnlockTime con ubicación: ${e.message}")
                    }
                }
            }
            
            // Fallback: Si la ubicación no responde en 5 segundos, enviar update sin ubicación
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                if (!locationCallbackExecuted) {
                    Log.w(TAG, "Timeout de ubicación, enviando lastUnlockTime sin ubicación")
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val bearerToken = "Bearer $token"
                            val statusUpdate = DeviceStatusUpdate(
                                lastUnlockTime = System.currentTimeMillis(),
                                location = null
                            )

                            val response = ApiClient.apiService.updateDeviceStatus(bearerToken, deviceId, statusUpdate)

                            if (response.isSuccessful) {
                                Log.d(TAG, "Último desbloqueo actualizado exitosamente sin ubicación (fallback)")
                            } else {
                                Log.e(TAG, "Error al actualizar solo lastUnlockTime fallback: ${response.code()}")
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Error al actualizar solo lastUnlockTime fallback: ${e.message}")
                        }
                    }
                }
            }, 3000L) // 3 segundos timeout para fallback
            
            // Retornar true inmediatamente ya que la ubicación se maneja en callback
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error al actualizar solo lastUnlockTime", e)
            false
        }
    }
}
