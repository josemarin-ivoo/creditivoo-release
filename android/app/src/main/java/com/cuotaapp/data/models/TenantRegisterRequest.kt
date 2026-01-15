package com.cuota.data.models

data class TenantRegisterRequest(
    val tenantId: String,
    val androidId: String,
    val brand: String,
    val model: String,
    val version: String
)
