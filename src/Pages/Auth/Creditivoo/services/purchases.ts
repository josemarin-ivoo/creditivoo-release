import api from './api';
import {CreditErrorResponse} from './credit';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  PASS_DUE = 'PASS_DUE',
}

export interface Payment {
  id: number;
  purchaseId: number;
  userId: number;
  amount: string;
  penaltyAmount?: string | null;
  isInitialPayment: boolean;
  paymentDate: string;
  method: string;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedById?: number | null;
  updatedByDate?: string | null;
  tenantId?: number | null;
  paymentReferenceId?: number | null;
  paymentMethodTenantId?: number | null;
  branchId?: number | null;
  hasPartialPayments: boolean;
  [key: string]: any;
}

export interface PurchaseResponse {
  id: number;
  userId: number;
  sellerId?: number;
  deviceId?: number | null;
  imei?: string | null;
  financingTypeId: number;
  termsAndConditionsId?: number | null;
  totalAmount: string;
  initialPayment?: string | null;
  installmentAmount?: string | null;
  invoiceNumber?: string | null;
  daysBetweenPayments?: number | null;
  status: string; // e.g., 'IN_REVIEW_BY_CLIENT', 'PENDING', 'COMPLETED', 'CANCELLED'
  createdAt: string;
  updatedAt: string;
  productUnitId?: number | null;
  tenantId?: number | null;
  branchId?: number | null;
  devicePriceId?: number | null;
  storeId?: number | null;
  productId?: number | null;
  productPriceId?: number | null;
  user?: {
    id: number;
    email: string;
    name: string;
    lastname: string;
    [key: string]: any;
  };
  device?: {
    id: number;
    name: string;
    brand?: string;
    model?: string;
    [key: string]: any;
  } | null;
  branch?: {
    id: number;
    name: string;
    [key: string]: any;
  } | null;
  store?: {
    id: number;
    name: string;
    [key: string]: any;
  } | null;
  tenant?: {
    id: number;
    name: string;
    [key: string]: any;
  } | null;
  financingType?: {
    id: number;
    name: string;
    paymentCount: number;
    interestRate: string;
    initialPayment: string;
    daysBetweenPayments: number;
    [key: string]: any;
  };
  payments?: Payment[];
  [key: string]: any;
}

/**
 * Obtiene las compras de un usuario por su ID.
 * Endpoint: GET /api/purchases/users/:userId
 * @param userId - ID del usuario
 */
export async function getPurchasesByUserId(
  userId: number,
): Promise<PurchaseResponse[]> {
  try {
    console.log('[Purchases Service] ===== GET PURCHASES BY USER ID =====');
    console.log(
      '[Purchases Service] Endpoint:',
      api.defaults.baseURL + `/purchases/users/${userId}`,
    );
    console.log('[Purchases Service] User ID:', userId);

    const response = await api.get<PurchaseResponse[]>(
      `/purchases/users/${userId}`,
    );

    console.log('[Purchases Service] Purchases obtenidas:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('[Purchases Service] Error al obtener purchases:', error);

    // Si es un 404, el usuario no tiene compras aún (usuario nuevo) - esto es normal
    if (error.response?.status === 404) {
      console.log(
        `[Purchases Service] Usuario ${userId} no tiene compras aún (usuario nuevo)`,
      );
      return [];
    }

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al obtener las compras';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Obtiene una compra por su ID, incluyendo los payments asociados.
 * Endpoint: GET /api/purchases/:id
 * @param purchaseId - ID de la compra
 */
export async function getPurchaseById(
  purchaseId: number,
): Promise<PurchaseResponse> {
  try {
    console.log('[Purchases Service] ===== GET PURCHASE BY ID =====');
    console.log(
      '[Purchases Service] Endpoint:',
      api.defaults.baseURL + `/purchases/${purchaseId}`,
    );
    console.log('[Purchases Service] Purchase ID:', purchaseId);

    const response = await api.get<PurchaseResponse>(
      `/purchases/${purchaseId}`,
    );

    console.log('[Purchases Service] Purchase obtenida:', response.data);
    console.log(
      '[Purchases Service] Purchase completa (JSON):',
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error: any) {
    console.error('[Purchases Service] Error al obtener purchase:', error);

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al obtener la compra';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

export interface CreatePurchaseRequest {
  userId: number;
  isForPlanSubscription?: boolean;
  [key: string]: any;
}

/**
 * Crea una nueva purchase.
 * Endpoint: POST /api/purchases
 * @param data - Datos de la purchase a crear
 */
export async function createPurchase(
  data: CreatePurchaseRequest,
): Promise<PurchaseResponse> {
  try {
    console.log('[Purchases Service] ===== CREATE PURCHASE =====');
    console.log(
      '[Purchases Service] Endpoint:',
      api.defaults.baseURL + '/purchases',
    );
    console.log('[Purchases Service] Request data:', {
      ...data,
    });

    const response = await api.post<PurchaseResponse>('/purchases', data);

    console.log('[Purchases Service] Purchase creada exitosamente:', {
      purchaseId: response.data.id,
      status: response.data.status,
    });

    return response.data;
  } catch (error: any) {
    console.error('[Purchases Service] Error al crear purchase:', error);

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al crear la compra';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

export interface UpdatePurchaseRequest {
  status?: string;
  [key: string]: any;
}

/**
 * Actualiza una purchase existente.
 * Endpoint: PUT /api/purchases/:id
 * @param purchaseId - ID de la purchase a actualizar
 * @param data - Datos a actualizar
 */
export async function updatePurchase(
  purchaseId: number,
  data: UpdatePurchaseRequest,
): Promise<PurchaseResponse> {
  try {
    console.log('[Purchases Service] ===== UPDATE PURCHASE =====');
    console.log(
      '[Purchases Service] Endpoint:',
      api.defaults.baseURL + `/purchases/${purchaseId}`,
    );
    console.log('[Purchases Service] Purchase ID:', purchaseId);
    console.log('[Purchases Service] Request data:', data);

    const response = await api.put<PurchaseResponse>(
      `/purchases/${purchaseId}`,
      data,
    );

    console.log('[Purchases Service] Purchase actualizada exitosamente:', {
      purchaseId: response.data.id,
      status: response.data.status,
    });

    return response.data;
  } catch (error: any) {
    console.error('[Purchases Service] Error al actualizar purchase:', error);

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al actualizar la compra';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}
