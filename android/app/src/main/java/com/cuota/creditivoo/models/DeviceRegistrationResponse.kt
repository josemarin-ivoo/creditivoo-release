package com.cuota.models

data class DeviceRegistrationResponse(
    val id: String,
    val unlockCode: String,
    val adminRemoveLockPin: String? = null,
    val status: String? = null,
    val randomId: String? = null
) 