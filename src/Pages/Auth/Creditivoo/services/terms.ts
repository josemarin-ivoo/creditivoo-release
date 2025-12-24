import api from './api';

export interface TermsAndConditionsResponse {
  id: number;
  mainTitle: string;
  mainText: string;
  confirmText: string;
  is_active: boolean;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: number;
}

export interface TermsAndConditionsErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Obtiene los términos y condiciones activos.
 * Endpoint: GET /api/terms-and-conditions/active-terms-and-conditions
 */
export async function getActiveTermsAndConditions(): Promise<TermsAndConditionsResponse> {
  try {
    console.log(
      '[Terms Service] ===== OBTENIENDO TÉRMINOS Y CONDICIONES ACTIVOS =====',
    );
    console.log(
      '[Terms Service] Endpoint:',
      api.defaults.baseURL +
        '/terms-and-conditions/active-terms-and-conditions',
    );

    const response = await api.get<TermsAndConditionsResponse>(
      '/terms-and-conditions/active-terms-and-conditions',
    );

    console.log(
      '[Terms Service] Términos y condiciones obtenidos exitosamente:',
      response.data,
    );

    return response.data;
  } catch (error: any) {
    console.error(
      '[Terms Service] Error al obtener términos y condiciones:',
      error,
    );

    if (error.response) {
      const errorData = error.response.data as TermsAndConditionsErrorResponse;
      const errorMessage =
        errorData.message ||
        errorData.error ||
        'Error al obtener los términos y condiciones';
      throw new Error(errorMessage);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}
