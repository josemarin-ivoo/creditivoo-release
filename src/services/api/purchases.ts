import api from './index';
import {DeviceModel} from './models';

export interface Purchase {
  userId: number | null;
  deviceId: number | null;
  imei?: string | null;
  devicePriceId?: number | null;
  deviceUnitId: number | null;
  financingTypeId: number | null;
  totalAmount: number | null;
  initial_payment?: number | null;
  installment_amount?: number | null;
  days_between_payments?: number | null;
  sellerId?: number | null;
  sellerName?: string | null;
  sellerLastName?: string | null;
  status: PurchaseStatus;
}

export interface PurchaseResponse {
  id: number;
  userId: number;
  deviceId: number;
  imei?: string | null;
  financingTypeId: number;
  termsAndConditionsId?: number;
  termsAccepted?: boolean;
  totalAmount: string;
  initial_payment?: string;
  installment_amount?: string;
  days_between_payments?: number;
  status: PurchaseStatus;
  createdAt: string;
  updatedAt: string;
  device?: DeviceModel;
}

export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export async function createPurchase(
  purchase: Purchase,
): Promise<PurchaseResponse> {
  try {
    const response = await api.post<PurchaseResponse>('/purchases', purchase);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
}

export async function getPurchasesByUserId(
  userId: number,
  status?: 'PASS_DUE' | 'COMPLETED',
): Promise<PurchaseResponse[]> {
  try {
    const params = status ? {status} : {};
    const response = await api.get<PurchaseResponse[]>(
      `/purchases/users/${userId}`,
      {params},
    );
    return response.data;
  } catch (error: any) {
    // Si es un 404, el usuario no tiene compras aún (usuario nuevo) - esto es normal
    if (error.response?.status === 404) {
      console.log(
        `[Purchases API] Usuario ${userId} no tiene compras aún (usuario nuevo)`,
      );
      return [];
    }
    console.error(
      `Error fetching purchases for user with id ${userId}:`,
      error,
    );
    throw error;
  }
}

export async function acceptTermsAndConditions(
  purchaseId: number,
): Promise<PurchaseResponse> {
  try {
    const response = await api.put<PurchaseResponse>(
      `/purchases/${purchaseId}/accept-terms-and-conditions`,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error accepting terms and conditions for purchase with id ${purchaseId}:`,
      error,
    );
    throw error;
  }
}
