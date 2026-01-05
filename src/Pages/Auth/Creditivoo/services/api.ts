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

// Variable para evitar múltiples ejecuciones de logout simultáneas
let isRefreshing = false;

// Interceptor para responses
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Manejo de errores globales
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Rutas públicas que no deberían ejecutar logout cuando fallan con 401
      const publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/signup',
        '/otp/send-sms',
        '/otp/verify-sms',
        '/otp/send',
        '/otp/verify',
        '/otp/resend',
      ];

      const isPublicRoute = publicRoutes.some(route =>
        originalRequest.url?.includes(route),
      );

      // Solo ejecutar logout si NO es una ruta pública Y hay una sesión activa
      if (!isPublicRoute) {
        // Verificar si hay una sesión activa antes de ejecutar logout
        try {
          const {AuthStorage} = await import('../app/services/AuthStorage');
          const token = await AuthStorage.getToken();
          const hasActiveSession = !!token;

          if (hasActiveSession) {
            // Token expirado o inválido - ejecutar logout inmediatamente sin intentar refrescar
            console.warn(
              '[API] 401 Unauthorized - Token inválido o expirado, ejecutando logout',
            );

            // Evitar múltiples ejecuciones de logout simultáneas
            if (isRefreshing) {
              // Si ya se está procesando un logout, rechazar la petición
              return Promise.reject(error);
            }

            isRefreshing = true;
            originalRequest._retry = true;

            try {
              // Ejecutar logout inmediatamente sin intentar refrescar el token
              const {ivooStore} = await import('../store-creditivoo');
              const {logout} = await import('../store/slices/auth-slice');
              console.log('[API] Ejecutando logout desde interceptor...');
              const logoutPromise = ivooStore.dispatch(logout());
              await logoutPromise;
              console.log('[API] Logout completado, estado actualizado');

              // Verificar que el estado se actualizó
              const state = ivooStore.getState();
              console.log(
                '[API] Estado después de logout - isLoggedIn:',
                state?.auth?.isLoggedIn,
              );
            } catch (logoutError) {
              console.error('[API] Error ejecutando logout:', logoutError);
              // Fallback: limpiar AuthStorage manualmente
              try {
                const {AuthStorage} = await import('../app/services/AuthStorage');
                await AuthStorage.clearAuthData();
              } catch (clearError) {
                console.error(
                  '[API] Error en fallback de limpieza:',
                  clearError,
                );
              }
            } finally {
              isRefreshing = false;
            }

            // Crear un error más descriptivo
            const errorMessage =
              'Sesión expirada. Por favor, inicia sesión nuevamente.';
            const enhancedError = new Error(errorMessage);
            (enhancedError as any).isAuthError = true;
            (enhancedError as any).shouldLogout = true;

            return Promise.reject(enhancedError);
          }
        } catch (storageError) {
          // Si hay error accediendo al storage, continuar con el error original
          console.warn('[API] Error verificando sesión activa:', storageError);
        }
      }

      // Para rutas públicas o cuando no hay sesión activa, simplemente rechazar el error original
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      // Acceso denegado
      console.warn('[API] 403 Forbidden - Acceso denegado');
    }

    return Promise.reject(error);
  },
);

export default api;
