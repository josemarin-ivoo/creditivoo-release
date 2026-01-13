import api from './api';

export interface CreatePaymentOrderRequest {
  purchaseId?: number;
  amount?: number; // Para pagos de prueba
}

export interface CreatePaymentOrderResponse {
  message: string;
  paymentUrl: string;
  referencia: string;
}

export interface CreateMultiplePaymentsOrderRequest {
  paymentIds: number[];
}

export interface CreateMultiplePaymentsOrderResponse {
  message: string;
  paymentUrl: string;
  referencia: string;
  autoCompleted: boolean;
  isAlreadyVerified: boolean;
  requiresPayment: boolean;
}

export interface MegaSoftErrorResponse {
  message?: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface SubscriptionAmountResponse {
  amount: number;
}

export interface VerifyPaymentOrderRequest {
  control: string;
  purchaseId?: number;
}

export interface VerifyPaymentOrderResponse {
  control: string;
  purchaseId: number;
  approved: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Crea una orden de pago con MegaSoft y retorna una URL para usar en WebView.
 * Endpoint: POST /api/megasoft/payment-order
 * @param request - Datos de la orden de pago (purchaseId para compras o amount para pagos de prueba)
 */
export async function createPaymentOrder(
  request: CreatePaymentOrderRequest,
): Promise<CreatePaymentOrderResponse> {
  try {
    console.log('[MegaSoft Service] ===== CREAR ORDEN DE PAGO =====');
    console.log(
      '[MegaSoft Service] Endpoint:',
      api.defaults.baseURL + '/megasoft/payment-order',
    );
    console.log('[MegaSoft Service] Request:', request);

    const response = await api.post<CreatePaymentOrderResponse>(
      '/megasoft/payment-order',
      request,
    );

    console.log('[MegaSoft Service] Orden de pago creada exitosamente:', {
      paymentUrl: response.data.paymentUrl,
      referencia: response.data.referencia,
    });

    return response.data;
  } catch (error: any) {
    console.error('[MegaSoft Service] Error al crear orden de pago:', error);

    if (error.response) {
      const errorData = error.response.data as MegaSoftErrorResponse;
      const errorMessage =
        errorData.message ||
        errorData.error ||
        'Error al crear la orden de pago';
      throw new Error(errorMessage);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Crea una orden de pago de prueba con MegaSoft usando un monto fijo.
 * Endpoint: POST /api/megasoft/payment-order
 * @param amount - Monto fijo en USD para el pago de prueba (default: 50.0)
 */
export async function createTestPaymentOrder(
  amount: number = 50.0,
): Promise<CreatePaymentOrderResponse> {
  return createPaymentOrder({amount});
}

/**
 * Crea una orden de pago con MegaSoft para múltiples payments y retorna una URL para usar en WebView.
 * Endpoint: POST /api/megasoft/multiple-payments-order
 * @param request - Datos de la orden de pago (array de payment IDs)
 */
export async function createMultiplePaymentsOrder(
  request: CreateMultiplePaymentsOrderRequest,
): Promise<CreateMultiplePaymentsOrderResponse> {
  try {
    console.log('[MegaSoft Service] ===== CREAR ORDEN DE PAGO MÚLTIPLE =====');
    console.log(
      '[MegaSoft Service] Endpoint:',
      api.defaults.baseURL + '/megasoft/multiple-payments-order',
    );
    console.log('[MegaSoft Service] Request:', request);

    const response = await api.post<CreateMultiplePaymentsOrderResponse>(
      '/megasoft/multiple-payments-order',
      request,
    );

    console.log(
      '[MegaSoft Service] Orden de pago múltiple creada exitosamente:',
      {
        paymentUrl: response.data.paymentUrl,
        referencia: response.data.referencia,
        autoCompleted: response.data.autoCompleted,
        requiresPayment: response.data.requiresPayment,
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      '[MegaSoft Service] Error al crear orden de pago múltiple:',
      error,
    );

    if (error.response) {
      const errorData: MegaSoftErrorResponse = error.response.data;
      const errorMessage =
        errorData.message ||
        errorData.error ||
        'Error al crear la orden de pago múltiple';
      throw new Error(errorMessage);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Obtiene el monto de la suscripción a PLAN PLUS.
 * Endpoint: GET /api/megasoft/subscription-amount
 * @returns El monto de la suscripción
 */
export async function getSubscriptionAmount(): Promise<number> {
  try {
    console.log(
      '[MegaSoft Service] ===== OBTENIENDO MONTO DE SUSCRIPCIÓN =====',
    );
    console.log(
      '[MegaSoft Service] Endpoint:',
      api.defaults.baseURL + '/megasoft/subscription-amount',
    );

    const response = await api.get<SubscriptionAmountResponse>(
      '/megasoft/subscription-amount',
    );

    console.log(
      '[MegaSoft Service] Monto de suscripción obtenido:',
      response.data.amount,
    );

    return response.data.amount;
  } catch (error: any) {
    console.error(
      '[MegaSoft Service] Error al obtener monto de suscripción:',
      error,
    );

    if (error.response) {
      const errorData = error.response.data as MegaSoftErrorResponse;
      const errorMessage =
        errorData.message ||
        errorData.error ||
        'Error al obtener el monto de suscripción';
      throw new Error(errorMessage);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Verifica el estado del pago localmente desde la base de datos.
 * Endpoint: POST /api/megasoft/payment-order/verify
 * @param request - Datos de verificación (control y opcionalmente purchaseId)
 * @returns Respuesta con el estado del pago
 */
export async function verifyPaymentOrder(
  request: VerifyPaymentOrderRequest,
): Promise<VerifyPaymentOrderResponse> {
  try {
    console.log('[MegaSoft Service] ===== VERIFICAR ESTADO DE PAGO =====');
    console.log(
      '[MegaSoft Service] Endpoint:',
      api.defaults.baseURL + '/megasoft/payment-order/verify',
    );
    console.log('[MegaSoft Service] Request:', request);

    const response = await api.post<VerifyPaymentOrderResponse>(
      '/megasoft/payment-order/verify',
      request,
    );

    console.log('[MegaSoft Service] Estado del pago:', {
      control: response.data.control,
      approved: response.data.approved,
      status: response.data.status,
    });

    return response.data;
  } catch (error: any) {
    console.error(
      '[MegaSoft Service] Error al verificar estado del pago:',
      error,
    );

    // Si es 404, el pago no fue encontrado (no aprobado)
    if (error.response?.status === 404) {
      return {
        control: request.control,
        purchaseId: request.purchaseId || 0,
        approved: false,
        status: 'NOT_FOUND',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Para otros errores, lanzar excepción
    if (error.response) {
      const errorData = error.response.data as MegaSoftErrorResponse;
      const errorMessage =
        errorData.message ||
        errorData.error ||
        'Error al verificar el estado del pago';
      throw new Error(errorMessage);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}