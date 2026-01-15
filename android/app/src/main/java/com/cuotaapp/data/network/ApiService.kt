package com.cuota.data.network

import com.cuota.data.models.TenantRegisterRequest
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.Response

interface ApiService {
    @POST("api/register-device")
    suspend fun registerProvisioning(
        @Header("Authorization") token: String,
        @Body request: TenantRegisterRequest
    ): Response<Void>
}
