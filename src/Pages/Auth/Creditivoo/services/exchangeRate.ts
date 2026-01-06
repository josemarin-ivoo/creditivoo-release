import api from './api';

export enum RateSource {
  BCV = 'BCV',
  MONITOR = 'MONITOR',
}

export interface ExchangeRate {
  id: number;
  currency: string;
  source: RateSource;
  rate: string; // La API devuelve rate como string (ej: "300")
  tenantId: number | null;
  userId: number | null;
  branchId: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Obtiene la tasa de cambio BCV-USD.
 * Endpoint: GET /api/exchange-rates/bcv-usd
 *
 * @returns Promise<ExchangeRate> - La tasa de cambio BCV-USD
 * @throws Error si no se encuentra tasa o hay un error en la petición
 */
export async function getLatestVesRate(): Promise<ExchangeRate> {
  try {
    const response = await api.get<ExchangeRate>('/exchange-rates/bcv-usd');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('No se encontró tasa de cambio en Bs activa');
    }
    console.error('[ExchangeRate] Error al obtener tasa de cambio:', error);
    throw new Error(
      error.response?.data?.error || 'Error al obtener la tasa de cambio',
    );
  }
}
