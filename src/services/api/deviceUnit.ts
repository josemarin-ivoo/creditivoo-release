import api from './index';

export interface DeviceUnitData {
  userId?: number;
  imei?: string;
  androidId?: string;
  serialNumber?: string;
  status: InventoryStatus;
  availability: Status;
  metadata: any;
}

export interface DeviceUnitResponse {
  id: number;
  deviceId: number;
  imei: string | null;
  androidId: string | null;
  serialNumber: string | null;
  status: InventoryStatus;
  availability: Status;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum Status {
  AVAILABLE = 'AVAILABLE',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  PENDING = 'PENDING',
}

export async function updateDeviceUnit(
  deviceUnitId: number,
  data: DeviceUnitData,
): Promise<DeviceUnitResponse> {
  try {
    const response = await api.put<DeviceUnitResponse>(
      `/device-unit/${deviceUnitId}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating device unit:', error);
    throw error;
  }
}
