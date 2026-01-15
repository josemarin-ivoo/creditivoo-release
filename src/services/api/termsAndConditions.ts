import api from './index';

export type TermsAndConditionsResponse = {
    id: number;
    mainTitle: string;
    mainText: string;
    confirmText: string;
    is_active: boolean;
    is_deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    tenantId: number;
  };
  
  export async function getTermsAndConditionsByID(
    id: number,
  ): Promise<TermsAndConditionsResponse> {
    try {
      const response = await api.get<TermsAndConditionsResponse>(
        `/terms-and-conditions/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching terms and conditions for id ${id}:`,
        error,
      );
      throw error;
    }
  }