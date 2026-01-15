package com.cuota.api

import com.cuota.models.DeviceRegistration
import com.cuota.models.DeviceRegistrationResponse
import com.cuota.models.DeviceStatusUpdate
import com.cuota.models.TenantConfig
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("api/devices-provisioning/registered-devices")
    suspend fun registerDevice(
        @Header("Authorization") token: String,
        @Body deviceRegistration: DeviceRegistration
    ): Response<DeviceRegistrationResponse>

    @GET("api/devices-provisioning/registered-devices/{deviceId}")
    suspend fun getDevice(
        @Header("Authorization") token: String,
        @Path("deviceId") deviceId: String
    ): Response<DeviceRegistrationResponse>

    @PUT("api/devices-provisioning/registered-devices/{deviceId}")
    suspend fun updateDeviceStatus(
        @Header("Authorization") token: String,
        @Path("deviceId") deviceId: String,
        @Body statusUpdate: DeviceStatusUpdate
    ): Response<DeviceRegistrationResponse>

    @GET("api/devices-provisioning/tenants/{id}")
    suspend fun getTenantConfig(
        @Header("Authorization") token: String,
        @Path("id") tenantId: String
    ): Response<TenantConfig>
} 