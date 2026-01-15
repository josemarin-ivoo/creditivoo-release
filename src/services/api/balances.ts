import api from './index';

export interface Transaction {
  id: number;
  balanceId: number;
  type: 'DEBIT' | 'CREDIT';
  amount: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  id: number;
  userId: number;
  currentBalance: string;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
}

export async function fetchUserBalance(
  userId: number,
): Promise<Balance | null> {
  try {
    const response = await api.get<Balance>(`/balances/${userId}`);
    return response.data;
  } catch (error: any) {
    // Si es un 404, el usuario no tiene balance aún (usuario nuevo) - esto es normal
    if (error.response?.status === 404) {
      console.log(
        `[Balance API] Usuario ${userId} no tiene balance aún (usuario nuevo)`,
      );
      return null;
    }
    console.error('Error fetching user balance:', error);
    throw error;
  }
}
