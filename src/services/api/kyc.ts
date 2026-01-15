import api from './index';

export interface CreateKycSessionResponse {
  message: string;
  sessionId: string;
  verificationUrl: string;
  sessionToken: string;
  sessionNumber: string;
  status: string;
}

export interface KycErrorResponse {
  message: string;
  error?: string;
  kyc_error_type?: string;
}

export interface KycStatusResponse {
  message: string;
  isVerified: boolean;
  status: string;
  decision?: string;
  decisionReason?: string;
}

/**
 * Crea una nueva sesión de verificación de identidad
 * El token se añade automáticamente en el interceptor de axios
 */
export async function createKycSession(): Promise<CreateKycSessionResponse> {
  try {
    console.log('[KYC API] Creando sesión de verificación');
    const response = await api.post<CreateKycSessionResponse>(
      '/kyc/create-session',
      {},
    );
    console.log('[KYC API] Sesión creada exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[KYC API] Error al crear sesión:', error);
    if (error.response) {
      const data = error.response.data as KycErrorResponse;

      // Si el usuario ya está verificado, lanzar un error especial que podamos identificar
      if (data.kyc_error_type === 'already_verified') {
        const alreadyVerifiedError = new Error(
          data.message || 'Usuario ya verificado',
        ) as any;
        alreadyVerifiedError.kyc_error_type = 'already_verified';
        throw alreadyVerifiedError;
      }

      throw new Error(
        data.message || 'Error al crear la sesión de verificación',
      );
    }
    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Verifica el estado de la verificación de identidad
 * El token se añade automáticamente en el interceptor de axios
 */
export async function checkKycStatus(): Promise<KycStatusResponse> {
  try {
    console.log('[KYC API] Verificando estado de KYC');
    const response = await api.get<KycStatusResponse>('/kyc/status');
    console.log('[KYC API] Estado de KYC:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[KYC API] Error al verificar estado:', error);
    if (error.response) {
      // Si es 404, retornamos un objeto con isVerified: false
      if (error.response.status === 404) {
        const data = error.response.data as KycStatusResponse;
        return {
          message: data.message || 'Verificación no encontrada',
          isVerified: false,
          status: data.status || 'pending',
        };
      }
      const data = error.response.data as KycErrorResponse;
      throw new Error(
        data.message || 'Error al verificar el estado de la verificación',
      );
    }
    throw new Error('No se pudo conectar al servidor');
  }
}
