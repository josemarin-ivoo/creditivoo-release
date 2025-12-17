import api from './api';

// TODO: Mover a configuración/env o usar react-native-config
const API_KEY = '5G7H9J2K8L1M4N6P';

// Tipos para las respuestas de la API
export interface SendOTPResponse {
  message: string;
  success: boolean;
  isAlreadyVerified?: boolean; // Indica si el teléfono/email ya estaba verificado
  expiresAt?: string;
  expiresInSeconds?: number;
  cooldownSeconds?: number;
  canResendAt?: string;
}

export interface VerifyOTPResponse {
  message: string;
  success: boolean;
  verified: boolean;
  isAlreadyVerified?: boolean; // Indica si el teléfono/email ya estaba verificado
  token?: string; // Token del usuario retornado al verificar OTP
  expiresAt?: string;
  expiresInSeconds?: number;
}

export interface ResendOTPResponse {
  message: string;
  success: boolean;
  expiresAt?: string;
  expiresInSeconds?: number;
  cooldownSeconds?: number;
  canResendAt?: string;
}

export interface OTPErrorResponse {
  message: string;
  error?: string;
  success?: boolean;
  cooldownSeconds?: number;
  canResendAt?: string;
}

/**
 * Envía un código OTP de 6 dígitos al número telefónico del usuario
 * @param phoneNumber - Número telefónico en formato internacional (ej: 584121234567)
 */
export async function sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
  try {
    console.log('[OTP Verification API] Enviando OTP a:', phoneNumber);
    console.log(
      '[OTP Verification API] Endpoint completo:',
      api.defaults.baseURL + '/otp/send-sms',
    );
    console.log('[OTP Verification API] Headers:', {'x-api-key': API_KEY});

    const response = await api.post<SendOTPResponse>(
      '/otp/send-sms',
      {
        phone: phoneNumber,
      },
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );

    console.log('[OTP Verification API] Respuesta recibida:', response.data);

    // Si el teléfono ya está verificado, retornar la respuesta sin error
    if (response.data.isAlreadyVerified) {
      console.log('[OTP Verification API] Teléfono ya verificado previamente');
    }

    return response.data;
  } catch (error: any) {
    console.error('[OTP Verification API] Error al enviar OTP:', error);

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

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Verifica el código OTP ingresado por el usuario
 * @param phoneNumber - Número telefónico en formato internacional (ej: 584121234567)
 * @param otpCode - Código OTP de 6 dígitos
 */
export async function verifyOTP(
  phoneNumber: string,
  otpCode: string,
): Promise<VerifyOTPResponse> {
  try {
    console.log('[OTP Verification API] Verificando OTP para:', phoneNumber);

    const response = await api.post<VerifyOTPResponse>(
      '/otp/verify-sms',
      {
        phone: phoneNumber,
        otpCode,
      },
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );

    console.log(
      '[OTP Verification API] Respuesta de verificación:',
      response.data,
    );

    // Si ya está verificado, tratar como verificado exitosamente
    if (response.data.isAlreadyVerified) {
      console.log('[OTP Verification API] Teléfono ya estaba verificado');
      return {
        ...response.data,
        verified: true,
      };
    }

    return response.data;
  } catch (error: any) {
    console.error('[OTP Verification API] Error al verificar OTP:', error);

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
 * Reenvía un nuevo código OTP al número telefónico del usuario
 * @param phoneNumber - Número telefónico en formato internacional (ej: 584121234567)
 */
export async function resendOTP(
  phoneNumber: string,
): Promise<ResendOTPResponse> {
  try {
    console.log('[OTP Verification API] Reenviando OTP a:', phoneNumber);

    const response = await api.post<ResendOTPResponse>(
      '/otp/resend-sms',
      {
        phone: phoneNumber,
      },
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );

    console.log('[OTP Verification API] Respuesta de reenvío:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('[OTP Verification API] Error al reenviar OTP:', error);

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
 * Envía un código OTP de 6 dígitos al email del usuario
 * @param email - Email del usuario
 */
export async function sendEmailOTP(email: string): Promise<SendOTPResponse> {
  try {
    console.log('[OTP Verification API] Enviando OTP a email:', email);
    console.log(
      '[OTP Verification API] Endpoint completo:',
      api.defaults.baseURL + '/otp/send',
    );
    console.log('[OTP Verification API] Headers:', {'x-api-key': API_KEY});

    const response = await api.post<SendOTPResponse>(
      '/otp/send',
      {
        email,
      },
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );

    console.log('[OTP Verification API] Respuesta recibida:', response.data);

    // Si el email ya está verificado, retornar la respuesta sin error
    if (response.data.isAlreadyVerified) {
      console.log('[OTP Verification API] Email ya verificado previamente');
    }

    return response.data;
  } catch (error: any) {
    console.error(
      '[OTP Verification API] Error al enviar OTP por email:',
      error,
    );

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

    throw new Error('No se pudo conectar al servidor');
  }
}

/**
 * Verifica el código OTP ingresado por el usuario para email
 * @param email - Email del usuario
 * @param otpCode - Código OTP de 6 dígitos
 */
export async function verifyEmailOTP(
  email: string,
  otpCode: string,
): Promise<VerifyOTPResponse> {
  try {
    console.log('[OTP Verification API] Verificando OTP para email:', email);

    const response = await api.post<VerifyOTPResponse>(
      '/otp/verify',
      {
        email,
        otpCode,
      },
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );

    console.log(
      '[OTP Verification API] Respuesta de verificación:',
      response.data,
    );

    // Si ya está verificado, tratar como verificado exitosamente
    if (response.data.isAlreadyVerified) {
      console.log('[OTP Verification API] Email ya estaba verificado');
      return {
        ...response.data,
        verified: true,
      };
    }

    return response.data;
  } catch (error: any) {
    console.error(
      '[OTP Verification API] Error al verificar OTP por email:',
      error,
    );

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
 * @param email - Email del usuario
 */
export async function resendEmailOTP(
  email: string,
): Promise<ResendOTPResponse> {
  try {
    console.log('[OTP Verification API] Reenviando OTP a email:', email);

    const response = await api.post<ResendOTPResponse>(
      '/otp/resend',
      {
        email,
      },
      {
        headers: {
          'x-api-key': API_KEY,
        },
      },
    );

    console.log('[OTP Verification API] Respuesta de reenvío:', response.data);

    return response.data;
  } catch (error: any) {
    console.error(
      '[OTP Verification API] Error al reenviar OTP por email:',
      error,
    );

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
