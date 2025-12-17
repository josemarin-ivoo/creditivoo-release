import api from './api';
import {Platform} from 'react-native';

// Tipos para las respuestas de la API de KYC
export interface IdVerificationResult {
  requestId: string | null;
  status: string | null; // "Approved" | "Declined" | "Pending" | null
  completed: boolean;
  result?: {
    status: string;
    [key: string]: any;
  };
}

export interface FaceMatchResult {
  requestId: string | null;
  status: string | null; // "Approved" | "Declined" | "Pending" | null
  score: number | null; // 0-100
  completed: boolean;
  result?: {
    status: string;
    score: number;
    meetsThreshold: boolean | null;
    [key: string]: any;
  };
}

export interface VerificationResults {
  hasBeenSentToDidit: boolean;
  idVerification: IdVerificationResult | null;
  faceMatch: FaceMatchResult | null;
}

export interface UploadStatusResponse {
  kycId?: number;
  currentStep: 'document-front' | 'document-back' | 'selfie' | 'complete';
  uploadStatus: 'pending' | 'partial' | 'complete';
  steps: {
    'document-front': {
      completed: boolean;
      uploadedAt: string | null;
    };
    'document-back': {
      completed: boolean;
      uploadedAt: string | null;
    };
    selfie: {
      completed: boolean;
      uploadedAt: string | null;
    };
  };
  canVerify: boolean;
  isVerified: boolean;
  verificationStatus: string | null; // "APPROVED" | "DECLINED" | "PENDING" | null
  verificationResults?: VerificationResults;
  message?: string;
  status?: 'APPROVED' | 'DECLINED' | 'PENDING';
  decision?: 'APPROVED' | 'DECLINED' | 'PENDING';
  decisionReason?: string;
}

export interface UploadDocumentResponse {
  message: string;
  url: string;
  s3Key: string;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  isVerified: boolean;
  status: 'APPROVED' | 'DECLINED' | 'PENDING';
  idVerificationResult?: {
    request_id: string;
    id_verification: {
      status: string;
      first_name?: string;
      last_name?: string;
      document_number?: string;
      document_type?: string;
      [key: string]: any;
    };
  };
  faceMatchResult?: {
    request_id: string;
    face_match: {
      status: string;
      score?: number;
    };
  };
}

export interface KycErrorResponse {
  message: string;
  error?: string;
}

export interface ResetKycRequest {
  deleteS3Files?: boolean;
}

export interface ResetKycResponse {
  success: boolean;
  message: string;
}

/**
 * Obtiene el estado actual de las subidas y el siguiente paso a completar
 */
export async function getUploadStatus(): Promise<UploadStatusResponse> {
  try {
    console.log('[KYC Service] ===== OBTENIENDO ESTADO DE KYC =====');
    const endpoint = '/kyc/upload-status';
    const fullUrl = api.defaults.baseURL + endpoint;
    console.log('[KYC Service] Endpoint completo:', fullUrl);
    console.log('[KYC Service] Método: GET');
    console.log('[KYC Service] Base URL:', api.defaults.baseURL);

    const response = await api.get<UploadStatusResponse>(endpoint);

    console.log('[KYC Service] Estado obtenido:', {
      kycId: response.data.kycId,
      currentStep: response.data.currentStep,
      uploadStatus: response.data.uploadStatus,
      canVerify: response.data.canVerify,
      isVerified: response.data.isVerified,
    });

    return response.data;
  } catch (error: any) {
    console.error('[KYC Service] Error al obtener estado:', error);
    console.error('[KYC Service] Error response:', error.response?.data);
    console.error('[KYC Service] Error status:', error.response?.status);
    console.error('[KYC Service] Error URL:', error.config?.url);
    console.error('[KYC Service] Error method:', error.config?.method);

    if (error.response) {
      const errorData = error.response.data as KycErrorResponse;
      const errorMessage =
        errorData.message ||
        errorData.error ||
        error.response.data?.message ||
        'Error al obtener estado de KYC';
      console.error(
        '[KYC Service] Mensaje de error del backend:',
        errorMessage,
      );
      throw new Error(errorMessage);
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Sube el documento frontal
 * @param imageUri - URI de la imagen a subir
 * @param kycId - ID de KYC (opcional, se obtiene del estado si no se proporciona)
 */
export async function uploadDocumentFront(
  imageUri: string,
  kycId?: number,
): Promise<UploadDocumentResponse> {
  try {
    console.log('[KYC Service] ===== SUBIENDO DOCUMENTO FRONTAL =====');
    console.log(
      '[KYC Service] Endpoint:',
      api.defaults.baseURL + '/kyc/upload-document-front',
    );
    console.log('[KYC Service] KYC ID:', kycId);

    const formData = new FormData();
    const uri =
      Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');

    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'document-front.jpg',
    } as any);

    // Si se proporciona kycId, agregarlo al formData
    if (kycId !== undefined && kycId !== null) {
      formData.append('kycId', kycId.toString());
    }

    const response = await api.post<UploadDocumentResponse>(
      '/kyc/upload-document-front',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('[KYC Service] Documento frontal subido exitosamente');
    return response.data;
  } catch (error: any) {
    console.error('[KYC Service] Error al subir documento frontal:', error);

    if (error.response) {
      const errorData = error.response.data as KycErrorResponse;
      throw new Error(
        errorData.message ||
          errorData.error ||
          'Error al subir documento frontal',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Sube el reverso del documento
 * @param imageUri - URI de la imagen a subir
 * @param kycId - ID de KYC (opcional, se obtiene del estado si no se proporciona)
 */
export async function uploadDocumentBack(
  imageUri: string,
  kycId?: number,
): Promise<UploadDocumentResponse> {
  try {
    console.log('[KYC Service] ===== SUBIENDO REVERSO DEL DOCUMENTO =====');
    console.log(
      '[KYC Service] Endpoint:',
      api.defaults.baseURL + '/kyc/upload-document-back',
    );
    console.log('[KYC Service] KYC ID:', kycId);

    const formData = new FormData();
    const uri =
      Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');

    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'document-back.jpg',
    } as any);

    // Si se proporciona kycId, agregarlo al formData
    if (kycId !== undefined && kycId !== null) {
      formData.append('kycId', kycId.toString());
    }

    const response = await api.post<UploadDocumentResponse>(
      '/kyc/upload-document-back',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('[KYC Service] Reverso del documento subido exitosamente');
    return response.data;
  } catch (error: any) {
    console.error('[KYC Service] Error al subir reverso del documento:', error);

    if (error.response) {
      const errorData = error.response.data as KycErrorResponse;
      throw new Error(
        errorData.message ||
          errorData.error ||
          'Error al subir reverso del documento',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Sube la selfie
 * @param imageUri - URI de la imagen a subir
 * @param kycId - ID de KYC (opcional, se obtiene del estado si no se proporciona)
 */
export async function uploadSelfie(
  imageUri: string,
  kycId?: number,
): Promise<UploadDocumentResponse> {
  try {
    console.log('[KYC Service] ===== SUBIENDO SELFIE =====');
    console.log(
      '[KYC Service] Endpoint:',
      api.defaults.baseURL + '/kyc/upload-selfie',
    );
    console.log('[KYC Service] KYC ID:', kycId);

    const formData = new FormData();
    const uri =
      Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');

    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'selfie.jpg',
    } as any);

    // Si se proporciona kycId, agregarlo al formData
    if (kycId !== undefined && kycId !== null) {
      formData.append('kycId', kycId.toString());
    }

    const response = await api.post<UploadDocumentResponse>(
      '/kyc/upload-selfie',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('[KYC Service] Selfie subida exitosamente');
    return response.data;
  } catch (error: any) {
    console.error('[KYC Service] Error al subir selfie:', error);

    if (error.response) {
      const errorData = error.response.data as KycErrorResponse;
      throw new Error(
        errorData.message || errorData.error || 'Error al subir selfie',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Verifica los documentos con Didit (síncrono, puede tardar 30-60 segundos)
 * @param kycId - ID de KYC (opcional, se obtiene del estado si no se proporciona)
 */
export async function verifyDocuments(kycId?: number): Promise<VerifyResponse> {
  try {
    console.log('[KYC Service] ===== VERIFICANDO DOCUMENTOS =====');
    console.log(
      '[KYC Service] Endpoint:',
      api.defaults.baseURL + '/kyc/verify',
    );
    console.log('[KYC Service] KYC ID:', kycId);
    console.log('[KYC Service] Nota: Este proceso puede tardar 30-60 segundos');

    const body = kycId !== undefined && kycId !== null ? {kycId} : {};

    const response = await api.post<VerifyResponse>('/kyc/verify', body, {
      timeout: 120000, // 120 segundos de timeout
    });

    console.log('[KYC Service] Verificación completada:', {
      success: response.data.success,
      isVerified: response.data.isVerified,
      status: response.data.status,
    });

    return response.data;
  } catch (error: any) {
    console.error('[KYC Service] Error al verificar documentos:', error);

    if (error.response) {
      const errorData = error.response.data as KycErrorResponse;
      throw new Error(
        errorData.message || errorData.error || 'Error al verificar documentos',
      );
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error(
        'La verificación está tardando más de lo esperado. Por favor, intenta de nuevo.',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

export interface ResetKycRequest {
  deleteS3Files?: boolean;
}

export interface ResetKycResponse {
  success: boolean;
  message: string;
}

/**
 * Resetea el proceso de KYC
 * @param deleteS3Files - Si es true, elimina los archivos de S3. Por defecto es false.
 */
export async function resetKyc(
  deleteS3Files: boolean = false,
): Promise<ResetKycResponse> {
  try {
    const body: ResetKycRequest = {
      deleteS3Files,
    };

    const response = await api.post<ResetKycResponse>('/kyc/reset', body);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data as KycErrorResponse;
      throw new Error(
        errorData.message || errorData.error || 'Error al resetear KYC',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}
