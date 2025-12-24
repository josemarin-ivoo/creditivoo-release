import {Platform} from 'react-native';
import api from './api';

export interface UploadProfilePictureResponse {
  message: string;
  url: string;
  s3Key: string;
}

export interface DeleteProfilePictureResponse {
  message: string;
}

export interface ProfilePictureErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Sube una foto de perfil del usuario autenticado.
 * Endpoint: POST /api/users/profile-picture
 * @param imageUri - URI de la imagen a subir
 */
export async function uploadProfilePicture(
  imageUri: string,
): Promise<UploadProfilePictureResponse> {
  try {
    console.log('[Profile Service] ===== SUBIENDO FOTO DE PERFIL =====');
    console.log(
      '[Profile Service] Endpoint:',
      api.defaults.baseURL + '/users/profile-picture',
    );

    const formData = new FormData();
    const uri =
      Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');

    // Determinar el tipo de imagen basado en la extensión
    const imageType = imageUri.toLowerCase().includes('.png')
      ? 'image/png'
      : imageUri.toLowerCase().includes('.webp')
      ? 'image/webp'
      : 'image/jpeg';

    formData.append('file', {
      uri,
      type: imageType,
      name: 'profile.jpg',
    } as any);

    const response = await api.post<UploadProfilePictureResponse>(
      '/users/profile-picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('[Profile Service] Foto de perfil subida exitosamente:', {
      url: response.data.url,
      s3Key: response.data.s3Key,
    });

    return response.data;
  } catch (error: any) {
    console.error('[Profile Service] Error al subir foto de perfil:', error);

    if (error.response) {
      const errorData = error.response.data as ProfilePictureErrorResponse;
      const errorMessage =
        errorData.message || errorData.error || 'Error al subir foto de perfil';
      throw new Error(errorMessage);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Elimina la foto de perfil del usuario autenticado.
 * Endpoint: DELETE /api/users/profile-picture
 */
export async function deleteProfilePicture(): Promise<DeleteProfilePictureResponse> {
  try {
    console.log('[Profile Service] ===== ELIMINANDO FOTO DE PERFIL =====');
    console.log(
      '[Profile Service] Endpoint:',
      api.defaults.baseURL + '/users/profile-picture',
    );

    const response = await api.delete<DeleteProfilePictureResponse>(
      '/users/profile-picture',
    );

    console.log('[Profile Service] Foto de perfil eliminada exitosamente');

    return response.data;
  } catch (error: any) {
    console.error('[Profile Service] Error al eliminar foto de perfil:', error);

    if (error.response) {
      const errorData = error.response.data as ProfilePictureErrorResponse;
      const errorMessage =
        errorData.message ||
        errorData.error ||
        'Error al eliminar foto de perfil';
      throw new Error(errorMessage);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}
