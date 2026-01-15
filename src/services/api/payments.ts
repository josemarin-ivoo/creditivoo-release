import api from './index';

export interface Payment {
  id: number;
  purchaseId: number;
  userId: number;
  amount: string;
  paymentDate: string;
  method: PaymentMethod;
  status: status;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod =
  | 'NOT_SELECTED'
  | 'MOBILE_PAYMENT'
  | 'BANK_TRANSFER'
  | 'CASH';

export type status =
  | 'SCHEDULED'
  | 'PENDING'
  | 'PENDING_CONFIRMATION'
  | 'COMPLETED'
  | 'FAILED'
  | 'PASS_DUE';

export enum PaymentStatus {
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PASS_DUE = 'PASS_DUE',
}

export interface PaymentOwnerField {
  id: number;
  name: string;
  hint: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId?: number;
  paymentMethodTenantId?: number;
}

export interface PaymentMethodModel {
  id: number;
  name: string;
  description?: string;
  reference?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  type: 'CUSTOM_FIELD' | 'DEFAULT';
  isDefault: boolean;
  tenantId?: number;
}

export interface ExchangeRate {
  id: number;
  rate: string;
  currency: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  tenantId: number;
}

export async function getPaymentsByPurchaseId(
  purchaseId: number,
): Promise<Payment[]> {
  try {
    const response = await api.get<Payment[]>(
      `/payments/purchases/${purchaseId}`,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching payments for purchase with id ${purchaseId}:`,
      error,
    );
    throw error;
  }
}

export const getAmountInBsForSelectedPayments = async (
  paymentIds: number[],
) => {
  try {
    const response = await api.post('/payments/total-amount', {paymentIds});
    return response.data;
  } catch (error) {
    console.error('Error fetching total payment in Bs', error);
    throw error;
  }
};

export async function updatePaymentStatus(
  paymentIds: number[],
  updateData: {method: PaymentMethod; status: status},
): Promise<Payment> {
  try {
    const response = await api.put<Payment>('/payments/bulk-update', {
      paymentIds,
      ...updateData,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating payments', error);
    throw error;
  }
}

export async function createMobilePayment(paymentData: {
  phone: string;
  paymentIds: number[];
  bank: string;
  reference: string;
  paymentDate: string;
}): Promise<void> {
  try {
    const response = await api.post('/mobile-payments', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating mobile payments:', error);
    throw error;
  }
}

export async function getPaymentOwnerFields(
  paymentMethodId?: string,
): Promise<PaymentOwnerField[]> {
  try {
    console.log('paymentMethodId', paymentMethodId);
    const response = await api.get<PaymentOwnerField[]>(
      '/payment-owner-fields',
      {
        params: {
          paymentMethodId,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching payment owner fields:', error);
    throw error;
  }
}

export async function getPaymentMethods(): Promise<PaymentMethodModel[]> {
  try {
    console.log('Making API call to /payment-methods');
    const response: any = await api.get<PaymentMethodModel[]>(
      '/payment-methods',
      {
        params: {
          isActive: true,
          type: 'DEFAULT',
        },
      },
    );
    console.log('Raw API response:', response);
    console.log('Response data:', response.data);
    console.log('Response data.data:', response.data?.data);
    return response.data?.data;
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
}

export const getPaymentOwnerData = async (paymentMethodId: string) => {
  try {
    console.log('paymentMethodId', paymentMethodId);
    const response = await api.get(`/payment-owner-data`, {
      params: {
        paymentMethodId,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export async function createPaymentReference(payload: {
  selectedPaymentsIds: number[];
  paymentData: {field: string; value: string}[];
  paymentMethodId: number;
}): Promise<void> {
  try {
    const response = await api.post('/payment-references', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating payment reference:', error);
    throw error;
  }
}

export async function getExchangeRate(): Promise<ExchangeRate> {
  try {
    const response = await api.get<ExchangeRate>('/exchange-rates/bcv-usd');
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
}
