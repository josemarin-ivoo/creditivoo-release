import api from './index';

export interface Tenant {
  id: number;
  name: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantsResponse {
  data: Tenant[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function fetchTenants(): Promise<Tenant[]> {
  try {
    console.log('[Tenants API] Fetching tenants from /tenants');
    const response = await api.get<TenantsResponse>('/tenants');
    console.log('[Tenants API] Response received:', response.data);
    console.log('[Tenants API] Response structure:', {
      hasData: !!response.data?.data,
      dataLength: response.data?.data?.length || 0,
      total: response.data?.total,
    });
    const tenants = response.data?.data || [];
    console.log('[Tenants API] Extracted tenants array:', tenants);
    console.log('[Tenants API] Number of tenants:', tenants.length);
    return tenants;
  } catch (error: any) {
    console.error('[Tenants API] Error fetching tenants:', error);
    console.error('[Tenants API] Error response:', error.response?.data);
    console.error('[Tenants API] Error status:', error.response?.status);
    throw error;
  }
}

export async function fetchTenantById(id: number): Promise<Tenant> {
  try {
    const response = await api.get<Tenant>(`/tenants/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant:', error);
    throw error;
  }
}
