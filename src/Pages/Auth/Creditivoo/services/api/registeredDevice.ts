import api from './index';

export async function updateRegisteredDeviceFromPing(
  id: number,
  data: any,
): Promise<any> {
  try {
    const response = await api.put<any>(`/registered-devices/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating registered device from ping:', error);
    throw error;
  }
}
