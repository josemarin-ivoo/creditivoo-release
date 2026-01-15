import api from "./index";

export interface UserDeviceData {
  userId: number;
  deviceId: number | null;
  uniqueAndroId: string;
}

export interface UserDeviceResponse {
  id: number;
  userId: number;
  deviceId: number;
  uniqueAndroId: string;
  createdAt: string;
  updatedAt: string;
}

export async function createUserDevice(
  data: UserDeviceData
): Promise<UserDeviceResponse> {
  try {
    const response = await api.post<UserDeviceResponse>("/user-device", data);
    return response.data;
  } catch (error) {
    console.error("Error creating user device:", error);
    throw error;
  }
}
