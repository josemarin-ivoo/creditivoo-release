import api from './api';

export interface PointsTransaction {
  id: number;
  amount: number;
  date: string; // YYYY-MM-DD
  reason: string;
  icon: string; // hourglass, bills, gem, star
  gemType: 'green' | 'purple';
}

export interface PointsData {
  totalPoints: number;
  currentPoints: number;
  experienceLevel: number;
  experiencePoints: number;
  nextLevelExp: number;
  expToNextLevel: number;
  levelProgress: number;
  lastPointsEarnedAt: string | null;
  recentTransactions: PointsTransaction[];
}

export interface PointsResponse {
  success: boolean;
  data: PointsData;
}

export interface PointsErrorResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

/**
 * Obtiene información completa de puntos/gemas del usuario autenticado.
 * Endpoint: GET /api/points/me
 */
export async function getPointsInfo(): Promise<PointsData> {
  try {
    const response = await api.get<PointsResponse>('/points/me');

    return response.data.data;
  } catch (error: any) {
    console.error(
      '[Points Service] Error al obtener información de puntos:',
      error,
    );

    if (error.response) {
      const errorData = error.response.data as PointsErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.error ||
        'Error al obtener información de gemas';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}
