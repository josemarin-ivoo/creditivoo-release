package com.cuota.models

data class LocationData(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val timestamp: Long,
    val provider: String? = null,
    val altitude: Double? = null
)
