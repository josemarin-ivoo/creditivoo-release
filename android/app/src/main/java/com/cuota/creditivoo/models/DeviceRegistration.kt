package com.cuota.models

import com.cuota.utils.SystemInfo

data class DeviceRegistration(
    val tenantId: String,
    val purchaseId: String?,
    val androidId: String,
    val imei: String?,
    val brand: String,
    val model: String,
    val version: String,
    val fcmToken: String,
    val appVersion: String,
    val registrationToken: String,
    val systemInfo: SystemInfo? = null
) 