import api, {apiUrl} from './index';

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  lastname: string;
  email: string;
  phone: string;
  dob: string;
  document: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  username: string;
  dob: string;
  document: string;
  role: string;
  isEmailVerified?: boolean;
  kycVerifications?: {
    verificationData?: {
      status?: string;
      id_verification?: {
        document_number?: string;
        document_type?: string;
      };
      liveness?: {
        score?: number;
      };
      face_match?: {
        score?: number;
      };
      created_at?: string;
    };
  };
}

export async function authLogin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  try {
    console.log('[AuthService] Starting login attempt');
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    if (!response.data || !response.data.user || !response.data.token) {
      console.error('[AuthService] Invalid response data:', response.data);
      throw new Error('Invalid response from server');
    }

    console.log('[AuthService] Login response received:', {
      hasUser: !!response.data.user,
      hasToken: !!response.data.token,
      userData: response.data.user,
    });

    return response.data;
  } catch (error: any) {
    console.error('[AuthService] Login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

// export async function registerUser(
//   userData: RegisterRequest,
// ): Promise<RegisterResponse> {
//   try {
//     const response = await api.post<RegisterResponse>(
//       '/auth/register',
//       userData,
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error registering user:', error);
//     throw error;
//   }
// }

export async function registerUser(
  name: string,
  lastname: string,
  email: string,
  password: string,
  document: string,
): Promise<{message: string; userEmail: string; userId: number}> {
  try {
    console.log(apiUrl + '/auth/register');
    const response = await api.post<{
      message: string;
      userEmail: string;
      userId: number;
    }>('/auth/register', {
      name,
      lastname,
      email,
      password,
      document,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Extract meaningful error message from server response
      console.error('Error registering user:', error.response.data.error);
      throw new Error(error.response.data.error || 'Error al registrarse');
    } else {
      console.error('Error registering user:', error);
      throw new Error('No se pudo conectar al servidor');
    }
  }
}

// Estas funciones están deprecadas, usar las de otp.ts en su lugar
// Se mantienen por compatibilidad temporal
export async function verifyOtp(code: string): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/auth/verify-otp', {
      code,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Error in verifyOtp:', error.response.data.error);
      throw new Error(error.response.data.error || 'Error al al verificar OTP');
    } else {
      console.error('Error registering user:', error);
      throw new Error('No se pudo conectar al servidor');
    }
  }
}

export async function resendOtp(email: string): Promise<void> {
  try {
    await api.post('/auth/resend-otp', {email});
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
}

export async function fetchMe(): Promise<User> {
  try {
    const response = await api.get<User>('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export interface UpdateUserRequest {
  name?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  dob?: string;
  document?: string;
}

export async function updateUser(data: UpdateUserRequest): Promise<User> {
  try {
    const response = await api.put<User>('/auth/me', data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        'Error al actualizar la información';
      throw new Error(errorMessage);
    }
    throw new Error('No se pudo conectar al servidor');
  }
}

export interface CompleteRegistrationRequest {
  password: string;
  confirmationPassword: string;
  name: string;
  lastname: string;
  document: string;
}

export interface CompleteRegistrationResponse {
  message: string;
  user?: User;
  token?: string;
}

export async function completeRegistration(
  data: CompleteRegistrationRequest,
): Promise<CompleteRegistrationResponse> {
  try {
    console.log('[AuthService] Completing registration:', {
      name: data.name,
      lastname: data.lastname,
      document: data.document,
    });
    const response = await api.post<CompleteRegistrationResponse>(
      '/auth/complete-registration',
      {
        password: data.password,
        confirmationPassword: data.confirmationPassword,
        name: data.name,
        lastname: data.lastname,
        document: data.document,
      },
    );
    console.log('[AuthService] Registration completed successfully');
    return response.data;
  } catch (error: any) {
    console.error('[AuthService] Error completing registration:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        'Error al completar el registro';
      throw new Error(errorMessage);
    }
    throw new Error('No se pudo conectar al servidor');
  }
}
