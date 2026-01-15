import { store } from 'store/store';
import { LoginResponse } from './auth';
import api, { apiUrl } from './index';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export interface SendUser {
  name: string;
  lastname: string;
  email: string;
  contractNumber: string;
  phone: string;
  dob: string;
  document: string;
}

export interface UserResponse extends LoginResponse {}

export async function createUserApi(user: SendUser): Promise<UserResponse> {
  try {
    console.log( user);
    const response = await api.post<UserResponse>('/users', user);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export const getUserByEmailApi = async (
  email: string
): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(`/users/email/${email}`);
  return response.data;
};

export const updateUserSelfieApi = async (formData: FormData) => {
  try {
    const state = store.getState();
    const token = state.auth.token;

    const fileEntry = (formData as any)._parts.find((part: [string, any]) => typeof part[1] === 'object');
    const file = fileEntry?.[1];
    if (!file?.uri) throw new Error('No se encontró URI en formData');

    const pathToCheck = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');

    // Esperar un poco para evitar fallas por acceso prematuro al archivo
    await new Promise(resolve => setTimeout(resolve, 10000));

    const exists = await RNFS.exists(pathToCheck);
    if (!exists) {
      console.error('Archivo no existe aún:', pathToCheck);
      throw new Error('Archivo no disponible para envío');
    }


    const response = await fetch(`${apiUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error response text (selfie):', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading selfie:', error);
    throw error;
  }
};

export const updateUserDocumentApi = async (formData: FormData) => {
  try {
    const state = store.getState();
    const token = state.auth.token;

    const fileEntry = (formData as any)._parts.find((part: [string, any]) => typeof part[1] === 'object');
    const file = fileEntry?.[1];
    if (!file?.uri) throw new Error('No se encontró URI en formData');

    const pathToCheck = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
    await new Promise(resolve => setTimeout(resolve, 10000));

    const exists = await RNFS.exists(pathToCheck);
    if (!exists) {
      console.error('Archivo no existe aún:', pathToCheck);
      throw new Error('Archivo no disponible para envío');
    }

    const response = await fetch(`${apiUrl}/api/upload?tenantId=4`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error response text (document):', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};
