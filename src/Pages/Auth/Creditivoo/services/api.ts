import axios from 'axios';

// TODO: Mover a configuración/env o usar react-native-config
// Esta URL debería venir de variables de entorno
// Local: http://10.0.2.2:3000
// Producción: https://api.ivoo.app
export const IVOO_API_URL = 'https://api-ivoo-dev.whaledigitals.com'; //'https://api-ivoo-dev.whaledigitals.com'; // URL local para desarrollo

const api = axios.create({
  baseURL: IVOO_API_URL + '/api',
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  async config => {
    // Agregar token de autenticación si existe
    try {
      const {AuthStorage} = await import('../app/services/AuthStorage');
      const token = await AuthStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Si hay error obteniendo el token, continuar sin él
      console.warn('[API] Error obteniendo token:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Variable para evitar múltiples llamadas simultáneas de refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para responses
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Manejo de errores globales
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Token expirado o inválido
      console.warn('[API] 401 Unauthorized - Token inválido o expirado');

      if (isRefreshing) {
        // Si ya se está refrescando, encolar la petición
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const {AuthStorage} = await import('../app/services/AuthStorage');
        const refreshTokenValue = await AuthStorage.getRefreshToken();

        console.log(
          '[API] Refresh token obtenido del storage:',
          !!refreshTokenValue,
        );

        if (!refreshTokenValue) {
          console.warn(
            '[API] No hay refresh token disponible, limpiando datos de autenticación',
          );
          await AuthStorage.clearAuthData();
          throw new Error('No hay refresh token disponible');
        }

        // Importar dinámicamente para evitar dependencias circulares
        const {refreshToken} = await import('./auth');
        const response = await refreshToken(refreshTokenValue);

        console.log(
          '[API] Token refrescado exitosamente, guardando nuevos tokens',
        );

        // Guardar nuevos tokens
        await AuthStorage.saveToken(response.token);
        await AuthStorage.saveRefreshToken(response.refreshToken);

        console.log('[API] Nuevos tokens guardados exitosamente');

        // Actualizar el header de la petición original
        originalRequest.headers.Authorization = `Bearer ${response.token}`;

        // Procesar cola de peticiones pendientes
        processQueue(null, response.token);
        isRefreshing = false;

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error(
          '[API] ===== ERROR AL REFRESCAR TOKEN EN INTERCEPTOR =====',
        );
        console.error('[API] Error completo:', refreshError);
        console.error('[API] Mensaje de error:', refreshError?.message);
        processQueue(refreshError, null);
        isRefreshing = false;

        // Si falla el refresh, limpiar datos y redirigir al login
        try {
          console.log(
            '[API] Limpiando datos de autenticación debido a error en refresh',
          );
          const {AuthStorage} = await import('../app/services/AuthStorage');
          await AuthStorage.clearAuthData();
          console.log('[API] Datos de autenticación limpiados exitosamente');

          // Intentar actualizar el estado de Redux si está disponible
          try {
            // Importar dinámicamente el store para evitar dependencias circulares
            const {ivooStore} = await import('../store-creditivoo');
            ivooStore.dispatch({type: 'auth/logout'});
            console.log('[API] Estado de Redux actualizado (logout)');
          } catch (reduxError) {
            console.warn(
              '[API] No se pudo actualizar el estado de Redux:',
              reduxError,
            );
          }
        } catch (clearError) {
          console.error(
            '[API] Error limpiando datos de autenticación:',
            clearError,
          );
        }

        // Crear un error más descriptivo
        const errorMessage =
          refreshError?.message ||
          'Sesión expirada. Por favor, inicia sesión nuevamente.';
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).isAuthError = true;
        (enhancedError as any).shouldLogout = true;

        return Promise.reject(enhancedError);
      }
    }

    if (error.response?.status === 403) {
      // Acceso denegado
      console.warn('[API] 403 Forbidden - Acceso denegado');
    }

    return Promise.reject(error);
  },
);

export default api;
