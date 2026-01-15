// import DeviceInfo from 'react-native-device-info'; // Deshabilitado - no se está usando
import api from './index';
import {saveRandomId} from '../storage/storageService';

export const getAndroidId = async (): Promise<string> => {
  try {
    // const androidId = await DeviceInfo.getUniqueId(); // Deshabilitado
    // Generar un ID temporal único (puedes usar una librería alternativa si es necesario)
    const androidId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return androidId;
  } catch (error) {
    console.error('Error getting Android ID:', error);
    throw error;
  }
};

export const getRandomId = async (androidId: string): Promise<string> => {
  try {
    const requestConfig = {
      headers: {
        'X-Public-Api-Key': '9ef61daf-536f-4683-b99d-1a56a2990dd2',
        'Content-Type': 'application/json',
      },
    };

    const response: any = await api.post(
      '/public/registered-devices/auth/exchange',
      {
        androidId: androidId,
      },
      requestConfig,
    );

    const randomId = response.data.randomId;

    // Guardar el randomId en almacenamiento local
    await saveRandomId(randomId);

    return randomId;
  } catch (error: any) {
    console.error('❌ Error getting random ID:', error);

    throw error;
  }
};
