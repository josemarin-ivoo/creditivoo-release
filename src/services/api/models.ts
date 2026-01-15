import api from './index';

export interface DeviceModel {
  id: number;
  name: string;
  model_number: string;
  price: string;
  ram: string;
  color: string;
  status: DeviceStatus;
  brandId: number;
  _count?: {
    deviceUnits?: number;
  };
  brand: {
    name: string;
  };
  deviceUnits: {
    id: number;
  }[];
}

export enum DeviceStatus {
  AVAILABLE = 'AVAILABLE',
  DISCONTINUED = 'DISCONTINUED',
}

export async function fetchModelsByBrand(
  brandId: number,
): Promise<DeviceModel[]> {
  try {
    const response = await api.get<DeviceModel[]>(`/devices/brand/${brandId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

export async function fetchModelById(id: number): Promise<DeviceModel> {
  try {
    const response = await api.get<DeviceModel>(`/devices/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching model by ID:', error);
    throw error;
  }
}
export interface Price {
  id: number;
  deviceId: number;
  amount: string;
  description?: string;
}

export async function fetchPricesByModelId(id: number): Promise<Price[]> {
  try {
    const response = await api.get<Price[]>(`/device-prices/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prices by ModelID:', error);
    throw error;
  }
}
