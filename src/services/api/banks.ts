import api from './index';

export interface BankInfo {
  label: string;
  value: string;
}

export interface BankAccountInfo {
  phoneNumber: string;
  rif: string;
  bank: string;
  bankCode: string;
}

// Endpoint para obtener la lista de bancos
export const fetchBankOptions = async (): Promise<BankInfo[]> => {
  const response = await api.get('/bank-info/list');
  console.log(response.data);
  return response.data;
};

// Endpoint para obtener la información de la cuenta bancaria de la empresa
export const fetchBankAccountInfo = async (): Promise<BankAccountInfo> => {
  const response = await api.get('/bank-info/store');
  return response.data;
};
