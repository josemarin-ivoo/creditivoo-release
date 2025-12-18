import api from './api';

export interface PlanGroup {
  id: number;
  name: string;
  description?: string;
  [key: string]: any;
}

export interface PlanGroupsResponse {
  data: PlanGroup[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface PlanGroupsErrorResponse {
  message?: string;
  error?: string;
}

export interface GetPlanGroupsParams {
  page?: number;
  pageSize?: number;
}

/**
 * Obtiene los grupos de planes disponibles.
 * Endpoint: GET /api/plan-groups
 * @param params - Parámetros de paginación (page, pageSize)
 */
export async function getPlanGroups(
  params: GetPlanGroupsParams = {page: 1, pageSize: 50},
): Promise<PlanGroupsResponse> {
  try {
    console.log('[Plan Service] ===== GET PLAN GROUPS =====');
    const queryParams = new URLSearchParams();
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('pageSize', (params.pageSize || 50).toString());

    const endpoint = `/plan-groups?${queryParams.toString()}`;
    console.log('[Plan Service] Endpoint:', api.defaults.baseURL + endpoint);
    console.log('[Plan Service] Params:', params);

    const response = await api.get<PlanGroupsResponse>(endpoint);

    console.log('[Plan Service] Plan groups obtenidos:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('[Plan Service] Error al obtener plan groups:', error);

    if (error.response) {
      const errorData = error.response.data as PlanGroupsErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al obtener los grupos de planes';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

export interface Financing {
  id: number;
  name: string;
  paymentCount: number;
  interestRate: number;
  additionalCost?: number;
  initialPayment: number;
  isBusinessDays: boolean;
  daysBetweenPayments: number;
  isActive: boolean;
  payAllAtOnce: boolean;
  isCustom?: boolean;
  sellerId?: number;
  sellerName?: string;
  sellerLastName?: string;
  initialAmount?: number;
  totalAmount?: number;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId?: number;
  financingCategoryId?: number;
  branchId?: number;
}

export interface PlansResponse {
  data?: Financing[];
  total?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Obtiene los planes (financing) de un grupo de planes.
 * Endpoint: GET /api/plan-groups/:id/plans
 * @param groupId - ID del grupo de planes
 */
export async function getPlansByGroupId(groupId: number): Promise<Financing[]> {
  try {
    console.log('[Plan Service] ===== GET PLANS BY GROUP ID =====');
    const endpoint = `/plan-groups/${groupId}/plans`;
    console.log('[Plan Service] Endpoint:', api.defaults.baseURL + endpoint);
    console.log('[Plan Service] Group ID:', groupId);

    const response = await api.get<Financing[] | PlansResponse>(endpoint);

    console.log('[Plan Service] Plans obtenidos:', response.data);

    // La respuesta puede ser un array directo o un objeto con data
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error: any) {
    console.error('[Plan Service] Error al obtener planes:', error);

    if (error.response) {
      const errorData = error.response.data as PlanGroupsErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al obtener los planes';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

export interface FinancingTypeResponse {
  id: number;
  name: string;
  paymentCount: number;
  interestRate: number;
  initialPayment: number;
  isBusinessDays: boolean;
  daysBetweenPayments: number;
  isActive: boolean;
  tenantId: number | null;
  branchId: number | null;
  sellerId: number | null;
  sellerName: string | null;
  sellerLastName: string | null;
  initialAmount: number | null;
  totalAmount: number | null;
  payAllAtOnce: boolean;
}

/**
 * Obtiene un financing type por su ID.
 * Endpoint: GET /api/financing/:id
 * @param financingId - ID del financing type
 */
export async function getFinancingById(
  financingId: number,
): Promise<FinancingTypeResponse> {
  try {
    console.log('[Plan Service] ===== GET FINANCING BY ID =====');
    const endpoint = `/financing/${financingId}`;
    console.log('[Plan Service] Endpoint:', api.defaults.baseURL + endpoint);
    console.log('[Plan Service] Financing ID:', financingId);

    const response = await api.get<FinancingTypeResponse>(endpoint);

    console.log('[Plan Service] Financing obtenido:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('[Plan Service] Error al obtener financing:', error);

    if (error.response) {
      const errorData = error.response.data as PlanGroupsErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al obtener el plan de financiamiento';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}
