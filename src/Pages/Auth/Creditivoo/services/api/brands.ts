import api from './index';

export interface Brand {
  name: string;
  description: string;
  is_active: boolean;
}

export async function fetchAllBrands(): Promise<Brand[]> {
  try {
    const response = await api.get<Brand[]>('/brands');
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
}
