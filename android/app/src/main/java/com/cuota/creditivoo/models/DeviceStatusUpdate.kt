package com.cuota.models

data class DeviceStatusUpdate(
    val lastUnlockTime: Long? = null,
    val lastHeartbeat: Long? = null,
    val fcmToken: String? = null,
    val status: String? = null,
    val currentState: String? = null,
    val location: LocationData? = null,
    val systemInfo: com.cuota.utils.SystemInfo? = null
) 