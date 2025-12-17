import api from './index';

export interface PaymentDetail {
  date: string;
  amount: number;
}

export interface FinancingOption {
  financing_type_id: number;
  name: string;
  initial_payment: string;
  installment_amount: string;
  payment_details: PaymentDetail[];
  total_amount: string;
  initial_percentage: string;
  is_active: boolean;
}

export interface ExchangeRate {
  id: number;
  currency: Currency;
  source: RateSource;
  rate: string;
  updatedAt: string;
  createdAt: string;
}

export type Currency = 'USD' | 'EUR';
export type RateSource = 'BCV' | 'MONITOR';

export async function fetchFinancingOptions(
  modelId: number,
): Promise<FinancingOption[]> {
  try {
    const response = await api.get<FinancingOption[]>(
      `/financing/devices/${modelId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching financing options:', error);
    throw error;
  }
}

export async function fetchFinancingOptionsByPriceId(
  priceId: number,
): Promise<FinancingOption[]> {
  try {
    const response = await api.get<FinancingOption[]>(
      `/financing/device-price/${priceId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching financing options:', error);
    throw error;
  }
}

export async function fetchExchangeRates(): Promise<ExchangeRate[]> {
  try {
    const response = await api.get<ExchangeRate[]>('/exchange-rates/');
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}
