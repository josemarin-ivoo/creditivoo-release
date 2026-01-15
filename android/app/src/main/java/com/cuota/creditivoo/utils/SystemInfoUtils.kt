package com.cuota.utils

import android.Manifest
import android.app.ActivityManager
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.net.ConnectivityManager
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.os.StatFs
import android.provider.Settings
import android.telephony.TelephonyManager
import android.telephony.SubscriptionManager
import android.util.Log
import androidx.core.content.ContextCompat
import io.sentry.Sentry
import java.io.File
import java.util.Locale
import java.util.TimeZone
import com.cuota.models.LocationData
import com.google.android.gms.location.*
import com.google.android.gms.tasks.CancellationTokenSource

/**
 * Clase utilitaria para obtener información del sistema del dispositivo
 * Reutilizable en cualquier parte de la aplicación
 */
object SystemInfoUtils {
        
    /**
     * Obtiene información completa del sistema del dispositivo
     * @param context Contexto de la aplicación
     * @return SystemInfo con toda la información del sistema
     */
    fun getSystemInfo(context: Context): SystemInfo {
        try {
            // Información de memoria RAM
            val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val memoryInfo = ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memoryInfo)
            
            // Información de almacenamiento
            val statFs = StatFs(Environment.getDataDirectory().path)
            
            // Información de pantalla
            val displayMetrics = context.resources.displayMetrics
            val configuration = context.resources.configuration
            
            // Información de red
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val networkInfo = connectivityManager.activeNetworkInfo
            
            // Información de WiFi
            val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val wifiInfo = wifiManager.connectionInfo
            
            // Información de seguridad
            val developerOptionsEnabled = Settings.Global.getInt(
                context.contentResolver, 
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 
                0
            ) == 1
            
            val usbDebuggingEnabled = Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.ADB_ENABLED,
                0
            ) == 1
            
            // Información de Device Owner
            val deviceOwnerInfo = getDeviceOwnerInfo(context)
            
            // Información de batería
            val batteryInfo = getBatteryInfo(context)
            
            return SystemInfo(
                // Memoria
                totalRam = memoryInfo.totalMem,
                availableRam = memoryInfo.availMem,
                maxMemory = Runtime.getRuntime().maxMemory(),
                
                // CPU
                cpuCores = Runtime.getRuntime().availableProcessors(),
                architecture = Build.CPU_ABI,
                supportedAbis = Build.SUPPORTED_ABIS.joinToString(","),
                
                // Almacenamiento
                totalStorage = statFs.totalBytes,
                availableStorage = statFs.availableBytes,
                
                // Pantalla
                screenWidth = displayMetrics.widthPixels,
                screenHeight = displayMetrics.heightPixels,
                screenDensity = displayMetrics.densityDpi,
                screenSize = when (configuration.screenLayout and Configuration.SCREENLAYOUT_SIZE_MASK) {
                    Configuration.SCREENLAYOUT_SIZE_SMALL -> "small"
                    Configuration.SCREENLAYOUT_SIZE_NORMAL -> "normal"
                    Configuration.SCREENLAYOUT_SIZE_LARGE -> "large"
                    Configuration.SCREENLAYOUT_SIZE_XLARGE -> "xlarge"
                    else -> "unknown"
                },
                
                // Red
                connectionType = networkInfo?.typeName ?: "unknown",
                macAddress = wifiInfo.macAddress,
                wifiSSID = wifiInfo.ssid,
                
                // Seguridad
                isRooted = checkRoot(),
                developerOptionsEnabled = developerOptionsEnabled,
                usbDebuggingEnabled = usbDebuggingEnabled,
                
                // Device Owner
                isDeviceOwner = deviceOwnerInfo.isDeviceOwner,
                hasDeviceOwner = deviceOwnerInfo.hasDeviceOwner,
                deviceOwnerName = deviceOwnerInfo.deviceOwnerName,
                deviceOwnerPackage = deviceOwnerInfo.deviceOwnerPackage,
                
                // Sistema
                buildNumber = Build.DISPLAY,
                securityPatch = Build.VERSION.SECURITY_PATCH,
                timezone = TimeZone.getDefault().id,
                language = Locale.getDefault().language,
                country = Locale.getDefault().country,
                
                // Hardware adicional
                manufacturer = Build.MANUFACTURER,
                product = Build.PRODUCT,
                device = Build.DEVICE,
                board = Build.BOARD,
                hardware = Build.HARDWARE,
                fingerprint = Build.FINGERPRINT,
                
                // Batería
                batteryLevel = batteryInfo.batteryLevel
            )
        } catch (e: Exception) {
            Sentry.captureException(e)
            return SystemInfo() // Retornar objeto vacío en caso de error
        }
    }
    
    /**
     * Obtiene el IMEI del dispositivo de forma segura
     * @param context Contexto de la aplicación
     * @return IMEI del dispositivo o null si no se puede obtener
     */
    fun getImei(context: Context): String? {
        try {
            // 1) Verificar TelephonyManager
            val tm = context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
            if (tm == null) {
                Log.w("SystemInfoUtils", "TelephonyManager no disponible")
                return null
            }
    
            // 2) Comprobar permiso READ_PHONE_STATE
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE)
                != PackageManager.PERMISSION_GRANTED) {
                Log.w("SystemInfoUtils", "Permiso READ_PHONE_STATE no concedido")
                return null
            }
    
            // 3) Intentar leer IMEI según la versión de Android
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    // Android 8.0+ (API 26+)
                    
                    // Método 1: Intentar obtener IMEI sin especificar slot
                    try {
                        val imei = tm.imei
                        if (!imei.isNullOrEmpty()) {
                            Log.d("SystemInfoUtils", "IMEI obtenido con tm.imei: $imei")
                            return imei
                        }
                    } catch (e: Exception) {
                        Log.d("SystemInfoUtils", "tm.imei falló: ${e.message}")
                    }
                    
                    // Método 2: Intentar obtener IMEI de todos los slots disponibles (dual SIM)
                    val subscriptionManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                        context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as? SubscriptionManager
                    } else {
                        null
                    }
                    
                    // Intentar slot 0 (primer SIM)
                    try {
                        val imei = tm.getImei(0)
                        if (!imei.isNullOrEmpty()) {
                            Log.d("SystemInfoUtils", "IMEI obtenido del slot 0: $imei")
                            return imei
                        }
                    } catch (e: Exception) {
                        Log.d("SystemInfoUtils", "getImei(0) falló: ${e.message}")
                    }
                    
                    // Intentar slot 1 (segundo SIM en dispositivos dual SIM)
                    try {
                        val imei = tm.getImei(1)
                        if (!imei.isNullOrEmpty()) {
                            Log.d("SystemInfoUtils", "IMEI obtenido del slot 1: $imei")
                            return imei
                        }
                    } catch (e: Exception) {
                        Log.d("SystemInfoUtils", "getImei(1) falló: ${e.message}")
                    }
                    
                    // Si tenemos SubscriptionManager, intentar obtener slots activos
                    if (subscriptionManager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                        try {
                            val subscriptionList = subscriptionManager.activeSubscriptionInfoList
                            if (subscriptionList != null) {
                                for (info in subscriptionList) {
                                    val slotIndex = info.simSlotIndex
                                    try {
                                        val imei = tm.getImei(slotIndex)
                                        if (!imei.isNullOrEmpty()) {
                                            Log.d("SystemInfoUtils", "IMEI obtenido del slot activo $slotIndex: $imei")
                                            return imei
                                        }
                                    } catch (e: Exception) {
                                        Log.d("SystemInfoUtils", "getImei($slotIndex) falló: ${e.message}")
                                    }
                                }
                            }
                        } catch (e: Exception) {
                            Log.d("SystemInfoUtils", "Error obteniendo subscription info: ${e.message}")
                        }
                    }
                } else {
                    // Android < 8.0 (API < 26)
                    @Suppress("DEPRECATION")
                    try {
                        val deviceId = tm.deviceId
                        if (!deviceId.isNullOrEmpty()) {
                            Log.d("SystemInfoUtils", "DeviceId obtenido (API < 26): $deviceId")
                            return deviceId
                        }
                    } catch (e: Exception) {
                        Log.d("SystemInfoUtils", "tm.deviceId falló: ${e.message}")
                    }
                }
                
                Log.w("SystemInfoUtils", "No se pudo obtener IMEI de ningún método")
                return null
            } catch (se: SecurityException) {
                // Incluso con la comprobación previa, Android 10+ o políticas OEM pueden bloquear el acceso
                Log.w("SystemInfoUtils", "SecurityException al obtener IMEI: ${se.message}")
                return null
            }
        } catch (e: Exception) {
            Log.e("SystemInfoUtils", "Error general al obtener IMEI: ${e.message}", e)
            Sentry.captureException(e)
            return null
        }
    }
    
    /**
     * Verifica si el dispositivo está rooteado
     * @return true si está rooteado, false en caso contrario
     */
    fun checkRoot(): Boolean {
        return try {
            val suPath = arrayOf(
                "/system/app/Superuser.apk",
                "/sbin/su",
                "/system/bin/su",
                "/system/xbin/su",
                "/data/local/xbin/su",
                "/data/local/bin/su",
                "/system/sd/xbin/su",
                "/system/bin/failsafe/su",
                "/data/local/su"
            )
            
            suPath.any { path ->
                try {
                    File(path).exists()
                } catch (e: Exception) {
                    false
                }
            }
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Verifica el estado de Device Owner del dispositivo
     * @param context Contexto de la aplicación
     * @return DeviceOwnerInfo con información del estado de DO
     */
    fun getDeviceOwnerInfo(context: Context): DeviceOwnerInfo {
        return try {
            val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            val packageName = context.packageName
            
            // Verificar si la app actual es Device Owner
            val isDeviceOwner = dpm.isDeviceOwnerApp(packageName)
            
            // Obtener el Device Owner actual (si existe)
            val currentDeviceOwner = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    // Usar reflexión para acceder a deviceOwnerName si está disponible
                    val method = dpm.javaClass.getMethod("getDeviceOwnerName")
                    method.invoke(dpm) as? String
                } catch (e: Exception) {
                    null
                }
            } else {
                null
            }
            
            // Verificar si hay Device Owner configurado
            val hasDeviceOwner = currentDeviceOwner != null
            
            // Obtener información adicional del Device Owner
            val deviceOwnerPackage = if (hasDeviceOwner) {
                try {
                    // Intentar obtener el package del DO usando reflexión
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        val method = dpm.javaClass.getMethod("getDeviceOwnerComponent")
                        val deviceOwnerComponent = method.invoke(dpm) as? ComponentName
                        deviceOwnerComponent?.packageName
                    } else {
                        null
                    }
                } catch (e: Exception) {
                    null
                }
            } else {
                null
            }
            
            DeviceOwnerInfo(
                isDeviceOwner = isDeviceOwner,
                hasDeviceOwner = hasDeviceOwner,
                deviceOwnerName = currentDeviceOwner,
                deviceOwnerPackage = deviceOwnerPackage,
                packageName = packageName
            )
        } catch (e: Exception) {
            Sentry.captureException(e)
            DeviceOwnerInfo(
                isDeviceOwner = false,
                hasDeviceOwner = false,
                deviceOwnerName = null,
                deviceOwnerPackage = null,
                packageName = context.packageName,
                error = e.message
            )
        }
    }
    
    /**
     * Obtiene el porcentaje de batería del dispositivo
     * @param context Contexto de la aplicación
     * @return BatteryInfo con solo el nivel de batería
     */
    fun getBatteryInfo(context: Context): BatteryInfo {
        return try {
            val intent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            
            if (intent != null) {
                val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                val batteryLevel = if (level != -1 && scale != -1) {
                    (level * 100 / scale.toFloat()).toInt()
                } else {
                    null
                }
                
                BatteryInfo(batteryLevel = batteryLevel)
            } else {
                BatteryInfo() // Retornar objeto vacío si no se puede obtener información
            }
        } catch (e: Exception) {
            Sentry.captureException(e)
            BatteryInfo() // Retornar objeto vacío en caso de error
        }
    }
    
    /**
     * Obtiene la ubicación actual del dispositivo usando el mismo patrón que DeviceManagerModule
     * @param context Contexto de la aplicación
     * @param callback Callback para manejar el resultado
     */
    fun getCurrentLocation(context: Context, callback: (LocationData?) -> Unit) {
        var callbackExecuted = false
        
        // Timeout de seguridad: SIEMPRE ejecutar callback después de 10 segundos máximo
        val safetyTimeout = Runnable {
            if (!callbackExecuted) {
                callbackExecuted = true
                callback(null)
            }
        }
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(safetyTimeout, 10000L) // 10 segundos timeout de seguridad
        
        try {
            val fusedClient = LocationServices.getFusedLocationProviderClient(context)
            
            // Función para crear LocationData desde android.location.Location
            fun createLocationData(location: android.location.Location): LocationData {
                return LocationData(
                    latitude = location.latitude,
                    longitude = location.longitude,
                    accuracy = location.accuracy,
                    timestamp = location.time,
                    provider = location.provider ?: "fused",
                    altitude = if (location.hasAltitude()) location.altitude else null
                )
            }
            
            // Función segura para ejecutar callback solo una vez
            fun safeCallback(locationData: LocationData?) {
                if (!callbackExecuted) {
                    callbackExecuted = true
                    android.os.Handler(android.os.Looper.getMainLooper()).removeCallbacks(safetyTimeout)
                    callback(locationData)
                }
            }
            
            // Intentar obtener la última ubicación conocida primero
            fusedClient.lastLocation
                .addOnSuccessListener { location ->
                    if (location != null) {
                        safeCallback(createLocationData(location))
                    } else {
                        // Si lastLocation es null, solicitar una nueva ubicación
                        requestFreshLocation(fusedClient, ::safeCallback, ::createLocationData)
                    }
                }
                .addOnFailureListener { e ->
                    safeCallback(null)
                }
        } catch (e: Exception) {
            Sentry.captureException(e)
            if (!callbackExecuted) {
                callbackExecuted = true
                android.os.Handler(android.os.Looper.getMainLooper()).removeCallbacks(safetyTimeout)
                callback(null)
            }
        }
    }

    /**
     * Solicita una nueva ubicación con timeout usando el mismo patrón que DeviceManagerModule
     * @param fusedClient Cliente de ubicación fusionada
     * @param callback Callback para manejar el resultado
     * @param createLocationData Función para crear LocationData
     */
    private fun requestFreshLocation(
        fusedClient: FusedLocationProviderClient,
        callback: (LocationData?) -> Unit,
        createLocationData: (android.location.Location) -> LocationData
    ) {
        try {
            
            // Crear el token de cancelación con timeout de 30 segundos
            val cancellationTokenSource = CancellationTokenSource()
            
            // Configurar la solicitud de ubicación actual
            val currentLocationRequest = CurrentLocationRequest.Builder()
                .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
                .setDurationMillis(30000L) // 30 segundos timeout
                .setMaxUpdateAgeMillis(60000L) // Máximo 1 minuto de edad
                .build()

            // Solicitar ubicación actual
            fusedClient.getCurrentLocation(currentLocationRequest, cancellationTokenSource.token)
                .addOnSuccessListener { location: android.location.Location? ->
                    if (location != null) {
                        callback(createLocationData(location))
                    } else {
                        callback(null)
                    }
                }
                .addOnFailureListener { e: Exception ->
                    callback(null)
                }

            // Cancelar después de 30 segundos si no se obtiene respuesta
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                if (!cancellationTokenSource.token.isCancellationRequested) {
                    cancellationTokenSource.cancel()
                    callback(null)
                }
            }, 30000L)

        } catch (e: Exception) {
            callback(null)
        }
    }
}

/**
 * Clase de datos para almacenar información del sistema del dispositivo
 */
data class SystemInfo(
    // Memoria
    val totalRam: Long? = null,
    val availableRam: Long? = null,
    val maxMemory: Long? = null,
    
    // CPU
    val cpuCores: Int? = null,
    val architecture: String? = null,
    val supportedAbis: String? = null,
    
    // Almacenamiento
    val totalStorage: Long? = null,
    val availableStorage: Long? = null,
    
    // Pantalla
    val screenWidth: Int? = null,
    val screenHeight: Int? = null,
    val screenDensity: Int? = null,
    val screenSize: String? = null,
    
    // Red
    val connectionType: String? = null,
    val macAddress: String? = null,
    val wifiSSID: String? = null,
    
    // Seguridad
    val isRooted: Boolean? = null,
    val developerOptionsEnabled: Boolean? = null,
    val usbDebuggingEnabled: Boolean? = null,
    
    // Device Owner
    val isDeviceOwner: Boolean? = null,
    val hasDeviceOwner: Boolean? = null,
    val deviceOwnerName: String? = null,
    val deviceOwnerPackage: String? = null,
    
    // Sistema
    val buildNumber: String? = null,
    val securityPatch: String? = null,
    val timezone: String? = null,
    val language: String? = null,
    val country: String? = null,
    
    // Hardware adicional
    val manufacturer: String? = null,
    val product: String? = null,
    val device: String? = null,
    val board: String? = null,
    val hardware: String? = null,
    val fingerprint: String? = null,
    
    // Batería
    val batteryLevel: Int? = null
)

/**
 * Clase de datos para almacenar información del Device Owner
 */
data class DeviceOwnerInfo(
    val isDeviceOwner: Boolean,
    val hasDeviceOwner: Boolean,
    val deviceOwnerName: String?,
    val deviceOwnerPackage: String?,
    val packageName: String,
    val error: String? = null
)

/**
 * Clase de datos para almacenar información de la batería
 */
data class BatteryInfo(
    val batteryLevel: Int? = null
)


    