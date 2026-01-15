import api from './index';

// TODO: Mover a configuración/env o usar react-native-config
const API_KEY = '5G7H9J2K8L1M4N6P'; // Reemplazar con la API key real del backend

// Tipos según la documentación de la API
export interface SendOTPResponse {
  message: string;
  expiresAt: string;
  expiresInSeconds: number;
  cooldownSeconds: number;
  canResendAt: string;
}

export interface VerifyOTPResponse {
  message: string;
  verified: boolean;
  token?: string; // Token del usuario retornado al verificar OTP
  expiresAt?: string;
  expiresInSeconds?: number;
}

export interface OTPErrorResponse {
  message: string;
  error?: string;
  cooldownSeconds?: number;
  canResendAt?: string;
}

export interface OTPStatusResponse {
  isValid: boolean;
  message: string;
}

/**
 * Envía un código OTP de 6 dígitos al email del usuario
 */
export async function sendOTP(email: string): Promise<SendOTPResponse> {
  try {
    if (!api) {
      throw new Error('API client no está inicializado');
    }

    console.log('[OTP API] Enviando OTP a:', email);
    console.log(
      '[OTP API] Endpoint completo:',
      api.defaults?.baseURL + '/otp/send',
    );
    console.log('[OTP API] Headers:', {'x-api-key': API_KEY});

    const response = await api.post<SendOTPResponse>(
      '/otp/send',
      {email},
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );
    console.log('[OTP API] Respuesta recibida:', response.data);
    console.log('[OTP API] URL completa de la petición:', response.config.url);

    return response.data;
  } catch (error: any) {
    console.error('[OTP API] Error al enviar OTP:', {
      message: error?.message,
      name: error?.name,
      response: error?.response
        ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          }
        : undefined,
    });

    if (error.response?.status === 429) {
      // Cooldown activo
      const data = error.response.data as OTPErrorResponse;
      throw new Error(
        data.message || `Cooldown: ${data.cooldownSeconds}s restantes`,
      );
    }

    if (error.response) {
      const data = error.response.data as OTPErrorResponse;
      throw new Error(data.message || 'Error al enviar OTP');
    }

    throw new Error(error?.message || 'No se pudo conectar al servidor');
  }
}

/**
 * Verifica el código OTP ingresado por el usuario
 */
export async function verifyOTP(
  email: string,
  otpCode: string,
): Promise<VerifyOTPResponse> {
  try {
    const response = await api.post<VerifyOTPResponse>(
      '/otp/verify',
      {email, otpCode},
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const data = error.response.data as VerifyOTPResponse | OTPErrorResponse;

      // Si el código es inválido pero no expirado, puede incluir expiresAt
      if (error.response.status === 400 && 'expiresAt' in data) {
        throw {
          message: (data as OTPErrorResponse).message || 'Código OTP inválido',
          expiresAt: (data as VerifyOTPResponse).expiresAt,
          expiresInSeconds: (data as VerifyOTPResponse).expiresInSeconds,
        };
      }

      throw new Error(
        (data as OTPErrorResponse).message || 'Error al verificar OTP',
      );
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Reenvía un nuevo código OTP al email del usuario
 */
export async function resendOTP(email: string): Promise<SendOTPResponse> {
  try {
    const response = await api.post<SendOTPResponse>(
      '/otp/resend',
      {email},
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429) {
      // Cooldown activo
      const data = error.response.data as OTPErrorResponse;
      throw new Error(
        data.message || `Cooldown: ${data.cooldownSeconds}s restantes`,
      );
    }

    if (error.response) {
      const data = error.response.data as OTPErrorResponse;
      throw new Error(data.message || 'Error al reenviar OTP');
    }

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Verifica si hay un OTP válido para el email
 */
export async function checkOTPStatus(
  email: string,
): Promise<OTPStatusResponse> {
  try {
    const response = await api.get<OTPStatusResponse>(`/otp/status/${email}`, {
      headers: {
        'x-api-key': API_KEY,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const data = error.response.data as OTPErrorResponse;
      throw new Error(data.message || 'Error al verificar estado del OTP');
    }

    throw new Error('No se pudo conectar al servidor');
  }
}
