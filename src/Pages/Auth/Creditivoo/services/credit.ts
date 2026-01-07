import api from './api';

export interface AssignCreditFromScoreRequest {
  score: number;
}

export interface AssignCreditFromScoreData {
  creditAssigned: number;
  creditLimit: number;
  creditAvailable: number;
  creditUsed: number;
  score: number;
  scoreRange: string;
}

export interface AssignCreditFromScoreResponse {
  success: boolean;
  data: AssignCreditFromScoreData;
}

export interface CreditErrorResponse {
  message?: string;
  error?: string;
}

export interface RevisionResponse {
  id: number;
  branchId: number | null;
  createdAt: string;
  daysBetweenPayments: number | null;
  deviceId: number | null;
  devicePriceId: number | null;
  financingTypeId: number | null;
  initialPayment: number | null;
  installmentAmount: number | null;
  invoiceNumber: string | null;
  productId: number | null;
  productPriceId: number | null;
  productUnitId: number | null;
  sellerId: number;
  status: string;
  storeId: number | null;
  tenantId: number | null;
  termsAndConditionsId: number | null;
  totalAmount: string;
  updatedAt: string;
  userId: number;
}

/**
 * Asigna una línea de crédito al usuario autenticado en base a su score.
 * Endpoint: POST /api/credit/assign-from-score
 */
export async function assignCreditFromScore(
  payload: AssignCreditFromScoreRequest,
): Promise<AssignCreditFromScoreResponse> {
  try {
    console.log('[Credit Service] ===== ASSIGN FROM SCORE =====');
    console.log(
      '[Credit Service] Endpoint:',
      api.defaults.baseURL + '/credit/assign-from-score',
    );
    console.log('[Credit Service] Payload:', payload);

    const response = await api.post<AssignCreditFromScoreResponse>(
      '/credit/assign-from-score',
      payload,
    );

    console.log('[Credit Service] Crédito asignado:', response.data?.data);

    return response.data;
  } catch (error: any) {
    console.error(
      '[Credit Service] Error al asignar crédito desde score:',
      error,
    );

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al asignar crédito';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Revisa el QR escaneado para validar y procesar.
 * Endpoint: POST /api/purchases/creditivoo/revision
 * Solo requiere el token de autenticación del usuario (no recibe body)
 */
export async function revisionQr(): Promise<RevisionResponse> {
  try {
    console.log('[Credit Service] ===== REVISION QR =====');
    console.log(
      '[Credit Service] Endpoint:',
      api.defaults.baseURL + '/purchases/creditivoo/revision',
    );

    const response = await api.post<RevisionResponse>(
      '/purchases/creditivoo/revision',
    );

    console.log('[Credit Service] Revisión exitosa:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('[Credit Service] Error al revisar QR:', error);

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al revisar el código QR';

      // Preservar el error original con response para que el código que maneja el error pueda acceder al status
      const customError: any = new Error(message);
      customError.response = error.response;
      throw customError;
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

export interface UpdatePurchaseRequest {
  financingTypeId: number;
}

export interface PurchaseSimulationResponse {
  payToday: number;
  installmentsCount: number;
  estimatedInstallment: number;
  financedAmount: number;
  newCreditBalance: number;
}

export interface Payment {
  id: number;
  amount: number;
  status: string;
  paymentDate: string;
  purchaseId: number;
}

export interface CreditInfo {
  hasActiveCredit: boolean;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  creditStatus: string | null;
  lastCreditTransactionAt: string | null;
  outstandingBalance: number;
  hasPassDuePayments: boolean;
  pendingPayment: Payment | null;
  overduePayment: Payment | null;
  nextPayment: Payment | null;
  nextPaymentDate: string | null;
}

export interface CreditInfoResponse {
  success: boolean;
  data: CreditInfo;
}

/**
 * Actualiza una purchase con el financingTypeId seleccionado.
 * Endpoint: PUT /api/purchases/:id
 */
export async function updatePurchase(
  purchaseId: number,
  payload: UpdatePurchaseRequest,
): Promise<RevisionResponse> {
  try {
    console.log('[Credit Service] ===== UPDATE PURCHASE =====');
    console.log(
      '[Credit Service] Endpoint:',
      api.defaults.baseURL + `/purchases/${purchaseId}`,
    );
    console.log('[Credit Service] Payload:', payload);

    const response = await api.put<RevisionResponse>(
      `/purchases/${purchaseId}`,
      payload,
    );

    console.log('[Credit Service] Purchase actualizada:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('[Credit Service] Error al actualizar purchase:', error);

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

/**
 * Obtiene una simulación de una purchase con el plan de pago seleccionado.
 * Endpoint: GET /api/purchases/:purchaseId/simulation
 */
export async function simulatePurchase(
  purchaseId: number,
): Promise<PurchaseSimulationResponse> {
  try {
    console.log('[Credit Service] ===== SIMULATE PURCHASE =====');
    console.log(
      '[Credit Service] Endpoint:',
      api.defaults.baseURL + `/purchases/${purchaseId}/simulation`,
    );

    const response = await api.get<PurchaseSimulationResponse>(
      `/purchases/${purchaseId}/simulation`,
    );

    console.log('[Credit Service] Simulación obtenida:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('[Credit Service] Error al obtener simulación:', error);

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al obtener la simulación';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Obtiene una purchase por su ID.
 * Endpoint: GET /api/purchases/:id
 */
export async function getPurchaseById(
  purchaseId: number,
): Promise<RevisionResponse> {
  try {
    console.log('[Credit Service] ===== GET PURCHASE BY ID =====');
    console.log(
      '[Credit Service] Endpoint:',
      api.defaults.baseURL + `/purchases/${purchaseId}`,
    );

    const response = await api.get<RevisionResponse>(
      `/purchases/${purchaseId}`,
    );

    console.log('[Credit Service] Purchase obtenida:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('[Credit Service] Error al obtener purchase:', error);

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

/**
 * Obtiene información completa sobre el crédito del usuario autenticado.
 * Endpoint: GET /api/credit/me
 */
export async function getCreditInfo(): Promise<CreditInfo> {
  try {
    const response = await api.get<CreditInfoResponse>('/credit/me');

    return response.data.data;
  } catch (error: any) {
    console.error(
      '[Credit Service] Error al obtener información de crédito:',
      error,
    );

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.error ||
        'Error al obtener información de crédito';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

export interface CreditMovement {
  id: number;
  type: 'purchase' | 'payment' | 'refund' | 'credit_granted';
  amount: number;
  description: string;
  status: string;
  date: string;
  purchase?: {
    id: number;
    totalAmount: number;
    status: string;
    store?: {
      id: number;
      name: string;
    } | null;
    product?: {
      id: number;
      name: string;
    } | null;
    device?: {
      id: number;
      name: string;
    } | null;
  } | null;
  payment?: {
    id: number;
    amount: number;
    status: string;
    paymentDate: string;
  } | null;
  balanceAfter: number;
  createdAt: string;
}

export interface CreditMovementsResponse {
  success: boolean;
  data: CreditMovement[];
  count: number;
}

/**
 * Obtiene todos los movimientos de crédito del usuario autenticado.
 * Endpoint: GET /api/credit/movements
 *
 * @param limit - Máximo número de movimientos a retornar (1-100, default: 100)
 * @param offset - Número de movimientos a omitir para paginación (default: 0)
 */
export async function getCreditMovements(
  limit?: number,
  offset?: number,
): Promise<CreditMovement[]> {
  try {
    console.log('[Credit Service] ===== GET CREDIT MOVEMENTS =====');
    console.log(
      '[Credit Service] Endpoint:',
      api.defaults.baseURL + '/credit/movements',
    );

    const params: any = {};
    if (limit !== undefined) {
      params.limit = limit;
    }
    if (offset !== undefined) {
      params.offset = offset;
    }

    const response = await api.get<CreditMovementsResponse>(
      '/credit/movements',
      {params},
    );

    console.log(
      '[Credit Service] Movimientos obtenidos:',
      response.data?.data?.length || 0,
      'movimientos',
    );

    return response.data.data;
  } catch (error: any) {
    console.error(
      '[Credit Service] Error al obtener movimientos de crédito:',
      error,
    );

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.error ||
        'Error al obtener movimientos de crédito';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Confirma una transacción de pago con el proveedor megasoft.
 * Endpoint: POST /api/purchases/paymentValidator/transaction/confirm/p/:control
 *
 * NOTA: Esta es una implementación provisional. En el futuro, el WebView de megasoft
 * enviará esta confirmación automáticamente al backend.
 *
 * @param purchaseId - El ID de la purchase (control)
 */
export async function confirmTransactionPayment(
  purchaseId: number,
): Promise<void> {
  try {
    console.log('[Credit Service] ===== CONFIRM TRANSACTION PAYMENT =====');
    console.log(
      '[Credit Service] Endpoint:',
      api.defaults.baseURL +
        `/purchases/paymentValidator/transaction/confirm/p/${purchaseId}`,
    );

    // Construir el XML según el formato requerido
    // NOTA: Estos valores son provisionales/dummy. En producción, megasoft enviará estos datos
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<response>
<control>${purchaseId}</control>
<cod_afiliacion>201909260244</cod_afiliacion>
<medio>CREDITO</medio>
<factura>1827</factura>
<monto>123456</monto>
<estado>A</estado>
<codigo>00</codigo>
<descripcion>
<![CDATA[ APROBADA ]]>
</descripcion>
<vtid>vpos</vtid>
<seqnum>1110</seqnum>
<authid>5661</authid>
<authname>P-Banesco</authname>
<referencia>3</referencia>
<terminal>7775</terminal>
<lote>9</lote>
<rifbanco>J-07013380-5</rifbanco>
<afiliacion>9876543112</afiliacion>
<tarjeta>4560351987</tarjeta>
<marca>Visa</marca>
<voucher>
<linea>_</linea>
<linea>
<UT>__DUPLICADO</UT>
</linea>
<linea>B_A_N_E_S_C_O_J-07013380-5</linea>
<linea>COMPRA</linea>
<linea>C2P_</linea>
<linea>CARACAS_</linea>
<linea>RIF:J1821821_AFIL:9876543112</linea>
<linea>TER:7775_LOTE:9_REF:3_</linea>
<linea>NRO.CTA:542007**9279_"M"</linea>
<linea>FECHA:05/06/2020_19:02:35_APROB:5661</linea>
<linea>SECUENCIA:1110_CAJA:MEGA01_</linea>
<linea>MONTO_BS.:1.234,56_</linea>
<linea>_</linea>
<linea>FIRMA:_</linea>
<linea>C.I.:__</linea>
<linea>_</linea>
</voucher>
</response>`;

    // Hacer la petición con Content-Type: application/xml
    const response = await api.post(
      `/purchases/paymentValidator/transaction/confirm/p/${purchaseId}`,
      xmlBody,
      {
        headers: {
          'Content-Type': 'application/xml',
        },
      },
    );

    console.log('[Credit Service] Transacción confirmada:', response.data);

    return;
  } catch (error: any) {
    console.error('[Credit Service] Error al confirmar transacción:', error);

    if (error.response) {
      const errorData = error.response.data as CreditErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error ||
        error.response.data?.message ||
        'Error al confirmar la transacción';
      throw new Error(message);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}
