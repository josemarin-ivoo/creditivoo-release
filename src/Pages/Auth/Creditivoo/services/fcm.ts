import {Platform} from 'react-native';
import api from './api';

/**
 * Obtiene la plataforma actual en el formato que espera el backend
 */
function getPlatform(): 'ANDROID' | 'IOS' | 'WEB' {
  if (Platform.OS === 'ios') {
    return 'IOS';
  } else if (Platform.OS === 'android') {
    return 'ANDROID';
  } else {
    return 'WEB';
  }
}

/**
 * Solicita permisos de notificaciones
 * @returns true si los permisos fueron concedidos, false en caso contrario
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    console.log('[FCM Service] Solicitando permisos de notificaciones...');
    // En React Native Firebase, Firebase se inicializa automáticamente
    // Intentar usar messaging() directamente - si Firebase no está inicializado, lanzará un error
    const isAuthorized = false;
    console.log('[FCM Service] Permisos concedidos:', isAuthorized);
    return isAuthorized;
  } catch (error: any) {
    // Si el error es sobre Firebase no inicializado, logear información útil
    if (
      error?.message?.includes('No Firebase App') ||
      error?.message?.includes('has been created')
    ) {
      console.error(
        '[FCM Service] Firebase no está inicializado. Asegúrate de que google-services.json esté en android/app/ y que el plugin com.google.gms.google-services esté aplicado en build.gradle',
      );
    }
    console.error('[FCM Service] Error al solicitar permisos:', error);
    return false;
  }
}

// Variable para almacenar el token FCM actual
let currentFCMToken: string | null = null;

/**
 * Obtiene el FCM token del dispositivo
 * @returns FCM token o null si no se puede obtener
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    console.log('[FCM Service] Obteniendo FCM token...');
    // En React Native Firebase, Firebase se inicializa automáticamente
    // Intentar usar messaging() directamente - si Firebase no está inicializado, lanzará un error
    const token = '';
    currentFCMToken = token;
    return token;
  } catch (error: any) {
    // Si el error es sobre Firebase no inicializado, logear información útil
    if (
      error?.message?.includes('No Firebase App') ||
      error?.message?.includes('has been created')
    ) {
      console.error(
        '[FCM Service] Firebase no está inicializado. Asegúrate de que google-services.json esté en android/app/ y que el plugin com.google.gms.google-services esté aplicado en build.gradle',
      );
    }
    console.error('[FCM Service] Error al obtener FCM token:', error);
    return null;
  }
}

/**
 * Obtiene el token FCM almacenado en memoria
 * @returns Token FCM actual o null
 */
export function getCurrentFCMToken(): string | null {
  return currentFCMToken;
}

/**
 * Registra o actualiza el FCM token en el backend
 * @param token - FCM token a registrar
 */
export async function registerFCMToken(token: string): Promise<void> {
  try {
    console.log('[FCM Service] Registrando FCM token en el backend');
    console.log(
      '[FCM Service] Token a registrar (primeros 20 chars):',
      token.substring(0, 20) + '...',
    );
    const platform = getPlatform();
    console.log('[FCM Service] Plataforma:', platform);
    console.log('[FCM Service] Endpoint: PUT /user/fcm-token');
    console.log('[FCM Service] Body:', {
      fcmToken: token.substring(0, 20) + '...',
      platform,
    });

    const response = await api.put('/user/fcm-token', {
      fcmToken: token,
      platform: platform,
    });

    console.log('[FCM Service] FCM token registrado exitosamente');
    console.log('[FCM Service] Respuesta del backend:', response.data);
  } catch (error: any) {
    console.error('[FCM Service] Error al registrar FCM token:', error);
    console.error('[FCM Service] Error details:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });
    // No lanzar error para no interrumpir el flujo de login
    // El token se intentará registrar en el siguiente login
  }
}

/**
 * Elimina o desactiva el FCM token en el backend
 * Si se proporciona un token, solo se desactiva ese token específico.
 * Si no se proporciona token, se desactivan TODOS los tokens del usuario.
 * @param token - Token FCM opcional a desactivar (si no se proporciona, usa el token actual almacenado)
 */
export async function removeFCMToken(token?: string): Promise<void> {
  try {
    console.log('[FCM Service] Desactivando FCM token(s) del backend');
    // Usar el token proporcionado, el token actual almacenado, o desactivar todos
    const tokenToDeactivate = token || currentFCMToken;
    const body = tokenToDeactivate ? {fcmToken: tokenToDeactivate} : {};
    await api.delete('/user/fcm-token', {data: body});
    // Limpiar el token almacenado después de desactivarlo
    currentFCMToken = null;
    console.log('[FCM Service] FCM token(s) desactivado(s) exitosamente');
  } catch (error: any) {
    console.error('[FCM Service] Error al desactivar FCM token:', error);
    // No lanzar error para no interrumpir el flujo de logout
  }
}

/**
 * Configura el listener para manejar la rotación de tokens
 * Debe llamarse después de un login exitoso
 * Retorna una función para limpiar el listener
 */
let tokenRefreshUnsubscribe: (() => void) | null = null;

export function setupTokenRefreshListener(): void {
  // Limpiar listener anterior si existe
  if (tokenRefreshUnsubscribe) {
    tokenRefreshUnsubscribe();
  }

  console.log('[FCM Service] Configurando listener de rotación de tokens');
}

/**
 * Limpia el listener de rotación de tokens
 */
export function cleanupTokenRefreshListener(): void {
  if (tokenRefreshUnsubscribe) {
    tokenRefreshUnsubscribe();
    tokenRefreshUnsubscribe = null;
    console.log('[FCM Service] Listener de rotación de tokens limpiado');
  }
}
