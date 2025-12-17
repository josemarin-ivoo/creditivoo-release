import api from './api';
import {User} from '../store-creditivoo/slices/auth-slice';

// Tipos para las respuestas de la API de autenticación
export interface RegisterRequest {
  phoneNumber: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthErrorResponse {
  message: string;
  error?: string;
  success?: boolean;
}

export interface UpdateMeRequest {
  name?: string;
  lastname?: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  enableFaceIdCheck?: boolean;
  enableBiometricCheck?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface MeResponse {
  user: User;
}

/**
 * Inicia sesión con email y password
 * @param data - Datos del login (email, password)
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  try {
    console.log('[Auth Service] ===== INICIANDO SESIÓN =====');
    console.log(
      '[Auth Service] Endpoint completo:',
      api.defaults.baseURL + '/auth/login',
    );
    console.log('[Auth Service] Email:', data.email);
    console.log('[Auth Service] Password:', '*** (oculto)');

    const response = await api.post<LoginResponse>('/auth/login', {
      email: data.email,
      password: data.password,
    });

    console.log('[Auth Service] Login exitoso:', {
      userId: response.data.user?.id,
      email: response.data.user?.email,
      token: response.data.token ? '***' : 'no token',
    });

    return response.data;
  } catch (error: any) {
    console.error('[Auth Service] ===== ERROR AL INICIAR SESIÓN =====');
    console.error('[Auth Service] Tipo de error:', error?.name || 'Unknown');
    console.error('[Auth Service] Mensaje de error:', error?.message);
    console.error('[Auth Service] Código de error:', error?.code);
    console.error('[Auth Service] Stack trace:', error?.stack);

    if (error.response) {
      console.error(
        '[Auth Service] Error response status:',
        error.response.status,
      );
      console.error(
        '[Auth Service] Error response statusText:',
        error.response.statusText,
      );
      console.error(
        '[Auth Service] Error response data:',
        JSON.stringify(error.response.data, null, 2),
      );
      console.error(
        '[Auth Service] Error response headers:',
        JSON.stringify(error.response.headers, null, 2),
      );

      const errorData = error.response.data as AuthErrorResponse;
      const errorMessage =
        errorData.message || errorData.error || 'Error al iniciar sesión';
      console.error(
        '[Auth Service] Mensaje de error del backend:',
        errorMessage,
      );
      throw new Error(errorMessage);
    }

    if (error.request) {
      console.error('[Auth Service] Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
        headers: error.config?.headers,
      });
      console.error(
        '[Auth Service] Request enviada pero sin respuesta del servidor',
      );
      throw new Error(
        'No se recibió respuesta del servidor. Verifica tu conexión a internet.',
      );
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('[Auth Service] Timeout en la petición');
      throw new Error(
        'La petición tardó demasiado. Verifica tu conexión a internet.',
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('[Auth Service] Error de conexión:', error.code);
      throw new Error(
        `No se pudo conectar al servidor (${error.code}). Verifica que el servidor esté disponible.`,
      );
    }

    console.error(
      '[Auth Service] Error desconocido:',
      JSON.stringify(error, null, 2),
    );
    throw new Error(error.message || 'No se pudo conectar al servidor');
  }
}

/**
 * Registra un nuevo usuario con phoneNumber, email y password
 * @param data - Datos del registro (phoneNumber, email, password)
 */
export async function registerUser(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  try {
    console.log('[Auth Service] ===== ENVIANDO REGISTRO FINAL =====');
    console.log(
      '[Auth Service] Endpoint completo:',
      api.defaults.baseURL + '/auth/register',
    );
    console.log('[Auth Service] Datos a enviar:');
    console.log('[Auth Service] - Phone:', data.phoneNumber);
    console.log('[Auth Service] - Email:', data.email);
    console.log('[Auth Service] - Password:', '*** (oculto)');

    // Preparar payload con los tres datos requeridos
    const payload = {
      phone: data.phoneNumber, // Enviar como 'phone' al backend
      email: data.email,
      password: data.password,
    };

    console.log('[Auth Service] Payload completo:', {
      ...payload,
      password: '***',
    });

    const response = await api.post<RegisterResponse>(
      '/auth/register',
      payload,
    );

    console.log('[Auth Service] Registro exitoso:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Auth Service] Error al registrar usuario:', error);

    if (error.response) {
      const errorData = error.response.data as AuthErrorResponse;
      throw new Error(
        errorData.message || errorData.error || 'Error al registrar usuario',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Obtiene la información del usuario actual
 */
export async function getMe(): Promise<MeResponse> {
  try {
    console.log(
      '[Auth Service] ===== OBTENIENDO INFORMACIÓN DEL USUARIO =====',
    );
    console.log('[Auth Service] Endpoint:', api.defaults.baseURL + '/auth/me');

    const response = await api.get<any>('/auth/me');

    console.log('[Auth Service] ===== RESPUESTA DEL SERVIDOR =====');
    console.log('[Auth Service] Status:', response.status);
    console.log('[Auth Service] Status Text:', response.statusText);
    console.log(
      '[Auth Service] Headers:',
      JSON.stringify(response.headers, null, 2),
    );
    console.log(
      '[Auth Service] Data completa:',
      JSON.stringify(response.data, null, 2),
    );
    console.log('[Auth Service] Tipo de data:', typeof response.data);
    console.log('[Auth Service] Es array?:', Array.isArray(response.data));
    console.log(
      '[Auth Service] Keys de data:',
      Object.keys(response.data || {}),
    );

    // El servidor puede devolver el usuario directamente o envuelto en { user: ... }
    let userData: User;
    if (response.data.user) {
      // Caso: { user: { id, email, ... } }
      userData = response.data.user;
    } else if (response.data.id && response.data.email) {
      // Caso: { id, email, ... } (usuario directamente)
      userData = response.data;
    } else {
      console.error(
        '[Auth Service] Estructura de respuesta desconocida:',
        response.data,
      );
      throw new Error('Estructura de respuesta del servidor no reconocida');
    }

    console.log('[Auth Service] Información del usuario procesada:', {
      userId: userData.id,
      email: userData.email,
    });

    return {user: userData};
  } catch (error: any) {
    console.error(
      '[Auth Service] Error al obtener información del usuario:',
      error,
    );

    if (error.response) {
      console.error('[Auth Service] Error response data:', error.response.data);
      const errorData = error.response.data as AuthErrorResponse;
      throw new Error(
        errorData.message ||
          errorData.error ||
          'Error al obtener información del usuario',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Actualiza la información del perfil del usuario
 * @param data - Datos a actualizar
 */
export async function updateMe(data: UpdateMeRequest): Promise<MeResponse> {
  try {
    console.log('[Auth Service] ===== ACTUALIZANDO PERFIL DEL USUARIO =====');
    console.log('[Auth Service] Datos a actualizar:', {
      ...data,
    });

    const response = await api.put<any>('/auth/me', data);

    console.log('[Auth Service] Status:', response.status);
    console.log(
      '[Auth Service] Data completa:',
      JSON.stringify(response.data, null, 2),
    );
    console.log('[Auth Service] Tipo de data:', typeof response.data);
    console.log('[Auth Service] Es array?:', Array.isArray(response.data));
    console.log(
      '[Auth Service] Keys de data:',
      Object.keys(response.data || {}),
    );

    // El servidor puede devolver el usuario directamente o envuelto en { user: ... }
    let userData: User;
    if (response.data.user) {
      // Caso: { user: { id, email, ... } }
      userData = response.data.user;
    } else if (response.data.id && response.data.email) {
      // Caso: { id, email, ... } (usuario directamente)
      userData = response.data;
    } else {
      console.error(
        '[Auth Service] Estructura de respuesta desconocida:',
        response.data,
      );
      throw new Error('Estructura de respuesta del servidor no reconocida');
    }

    console.log('[Auth Service] Perfil actualizado exitosamente:', {
      userId: userData.id,
      email: userData.email,
    });

    return {user: userData};
  } catch (error: any) {
    console.error('[Auth Service] Error al actualizar perfil:', error);

    if (error.response) {
      console.error('[Auth Service] Error response data:', error.response.data);
      const errorData = error.response.data as AuthErrorResponse;
      throw new Error(
        errorData.message || errorData.error || 'Error al actualizar perfil',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Cambia la contraseña del usuario
 * @param data - Datos del cambio de contraseña (currentPassword, newPassword)
 */
export async function changePassword(
  data: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  try {
    console.log('[Auth Service] ===== CAMBIANDO CONTRASEÑA =====');
    console.log('[Auth Service] Datos a enviar:', {
      currentPassword: '*** (oculto)',
      newPassword: '*** (oculto)',
    });

    const response = await api.put<ChangePasswordResponse>(
      '/auth/change-password',
      data,
    );

    console.log('[Auth Service] Contraseña cambiada exitosamente');

    return response.data;
  } catch (error: any) {
    console.error('[Auth Service] Error al cambiar contraseña:', error);

    if (error.response) {
      const errorData = error.response.data as AuthErrorResponse;
      throw new Error(
        errorData.message || errorData.error || 'Error al cambiar contraseña',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Refresca el token de autenticación usando el refresh token
 * @param refreshToken - El refresh token para obtener nuevos tokens
 */
export async function refreshToken(
  refreshTokenValue: string,
): Promise<RefreshTokenResponse> {
  try {
    console.log('[Auth Service] ===== REFRESCANDO TOKEN =====');
    console.log(
      '[Auth Service] Endpoint:',
      api.defaults.baseURL + '/auth/refresh-token',
    );
    console.log('[Auth Service] Refresh token presente:', !!refreshTokenValue);
    console.log(
      '[Auth Service] Refresh token (primeros 20 chars):',
      refreshTokenValue?.substring(0, 20) + '...',
    );

    const response = await api.post<RefreshTokenResponse>(
      '/auth/refresh-token',
      {
        refreshToken: refreshTokenValue,
      },
    );

    console.log('[Auth Service] ===== TOKEN REFRESCADO EXITOSAMENTE =====');
    console.log('[Auth Service] Status HTTP:', response.status);
    console.log('[Auth Service] Nuevo token presente:', !!response.data.token);
    console.log(
      '[Auth Service] Nuevo refresh token presente:',
      !!response.data.refreshToken,
    );

    return response.data;
  } catch (error: any) {
    console.error('[Auth Service] ===== ERROR AL REFRESCAR TOKEN =====');
    console.error('[Auth Service] Tipo de error:', error?.name || 'Unknown');
    console.error('[Auth Service] Mensaje de error:', error?.message);
    console.error('[Auth Service] Código de error:', error?.code);
    console.error('[Auth Service] Stack trace:', error?.stack);

    if (error.response) {
      console.error(
        '[Auth Service] Error response status:',
        error.response.status,
      );
      console.error(
        '[Auth Service] Error response statusText:',
        error.response.statusText,
      );
      console.error(
        '[Auth Service] Error response data:',
        JSON.stringify(error.response.data, null, 2),
      );
      console.error(
        '[Auth Service] Error response headers:',
        JSON.stringify(error.response.headers, null, 2),
      );

      const errorData = error.response.data as AuthErrorResponse;
      const errorMessage =
        errorData.message || errorData.error || 'Error al refrescar token';
      console.error(
        '[Auth Service] Mensaje de error del backend:',
        errorMessage,
      );

      // Si el refresh token está expirado o inválido, lanzar un error específico
      if (error.response.status === 401) {
        throw new Error(
          'Refresh token expirado o inválido. Por favor, inicia sesión nuevamente.',
        );
      }

      throw new Error(errorMessage);
    }

    if (error.request) {
      console.error('[Auth Service] Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        data: error.config?.data,
      });
      console.error(
        '[Auth Service] Request enviada pero sin respuesta del servidor',
      );
      throw new Error(
        'No se recibió respuesta del servidor. Verifica tu conexión a internet.',
      );
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('[Auth Service] Timeout en la petición');
      throw new Error(
        'La petición tardó demasiado. Verifica tu conexión a internet.',
      );
    }

    console.error(
      '[Auth Service] Error desconocido:',
      JSON.stringify(error, null, 2),
    );
    throw new Error(error.message || 'No se pudo conectar al servidor');
  }
}
