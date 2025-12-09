import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AuthStorage} from '@app-services/AuthStorage';
import {
  fetchMe,
  authLogin as loginService,
  registerUser,
  resendOtp,
  User,
  verifyOtp,
  completeRegistration as completeRegistrationService,
  CompleteRegistrationRequest,
  updateUser as updateUserService,
  UpdateUserRequest,
} from '@services/api/auth';
import {saveToken, saveUser} from '@services/storage/storageService';
import {sendOTP, verifyOTP, resendOTP} from '@services/api/otp';

interface AuthState {
  token: string | null;
  user: User | null;
  userMe: User | null;
  registerEmail: string | null;
  registerUserId: number | null;
  isLoading: boolean;
  isAutoLoginLoading: boolean;
  isLoggedIn: boolean;
  error: any;
  errorOtp: any;
  sessionExpired: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  userMe: null,
  registerEmail: null,
  registerUserId: null,
  isLoading: false,
  isAutoLoginLoading: false,
  isLoggedIn: false,
  error: null,
  errorOtp: null,
  sessionExpired: false,
};

// Helper function to validate user data
const isValidUser = (user: any): user is User => {
  return user && typeof user === 'object' && 'id' in user && 'email' in user;
};

// Helper function to validate token
const isValidToken = (token: string | null): boolean => {
  return !!token && token.length > 0;
};

// Async thunk to load auth state on app start
export const loadAuth = createAsyncThunk<
  {token: string | null; user: User | null},
  void,
  {rejectValue: string}
>(
  'auth/loadAuth',
  async (
    _,
    {rejectWithValue},
  ): Promise<
    | {token: string | null; user: User | null}
    | ReturnType<typeof rejectWithValue>
  > => {
    try {
      const token = await AuthStorage.getToken();
      const user = await AuthStorage.getUser();

      // No validation - just return what's stored or null
      return {token: token || null, user: user || null};
    } catch (error) {
      console.error('[AuthSlice] Error loading auth state:', error);
      // Don't clear auth data on error - just return null
      return {token: null, user: null};
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (
    {username, password}: {username: string; password: string},
    {rejectWithValue},
  ) => {
    try {
      console.log('[AuthSlice] Starting login attempt');
      const response = await loginService(username, password);
      console.log('[AuthSlice] Login service response received');

      if (!response || !response.user || !response.token) {
        console.error('[AuthSlice] Invalid response from service:', response);
        await AuthStorage.clearAuthData();
        return rejectWithValue('Invalid response from server');
      }

      if (!isValidUser(response.user)) {
        console.error('[AuthSlice] Invalid user data received:', response.user);
        await AuthStorage.clearAuthData();
        return rejectWithValue('Invalid user data received from server');
      }

      console.log('[AuthSlice] Saving auth data');
      await AuthStorage.saveToken(response.token);
      await AuthStorage.saveUser(response.user);
      return response;
    } catch (err: any) {
      console.error('[AuthSlice] Error caught:', {
        name: err.name,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      await AuthStorage.clearAuthData();

      // Handle Axios errors
      if (err.name === 'AxiosError') {
        if (err.response?.status === 401) {
          console.log('[AuthSlice] 401 Unauthorized error');
          return rejectWithValue(
            'Credenciales inválidas. Por favor, verifique su email y contraseña.',
          );
        }
        console.log('[AuthSlice] Other Axios error:', err.response?.data);
        return rejectWithValue(
          err.response?.data?.message ||
            err.message ||
            'Error al iniciar sesión',
        );
      }

      // Handle other errors
      console.log('[AuthSlice] Non-Axios error:', err);
      return rejectWithValue(err.message || 'Error al iniciar sesión');
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    {
      name,
      lastname,
      email,
      password,
      confirmPassword,
      document,
    }: {
      name: string;
      lastname: string;
      email: string;
      password: string;
      confirmPassword: string;
      document: string;
    },
    {rejectWithValue},
  ) => {
    try {
      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      const response = await registerUser(
        name,
        lastname,
        email,
        password,
        document,
      );

      return response;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const verifyOtpUser = createAsyncThunk(
  'auth/verifyOtpUser',
  async ({email, code}: {email: string; code: string}, {rejectWithValue}) => {
    try {
      const response = await verifyOTP(email, code);

      // Si la verificación es exitosa, el backend retorna el token
      // Guardamos el token en el store pero NO hacemos login completo
      // (no guardamos en storage, solo en memoria)
      return response;
    } catch (error: any) {
      // Manejar errores con expiresAt y expiresInSeconds
      if (error.expiresAt) {
        return rejectWithValue({
          message: error.message,
          expiresAt: error.expiresAt,
          expiresInSeconds: error.expiresInSeconds,
        });
      }

      if (error.response) {
        return rejectWithValue(error.response.data || error.message);
      }

      return rejectWithValue(error.message || 'Error al verificar OTP');
    }
  },
);

export const resendOtpUser = createAsyncThunk(
  'auth/resendOtpUser',
  async (email: string, {rejectWithValue}) => {
    try {
      const response = await resendOTP(email);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data || error.message);
      }
      return rejectWithValue(error.message || 'Error al reenviar OTP');
    }
  },
);

export const sendOtpUser = createAsyncThunk(
  'auth/sendOtpUser',
  async (email: string, {rejectWithValue}) => {
    try {
      console.log('[auth-slice] sendOtpUser llamado con email:', email);
      const response = await sendOTP(email);
      console.log('[auth-slice] sendOTP completado, respuesta:', response);
      return response;
    } catch (error: any) {
      console.error('[auth-slice] Error en sendOtpUser:', error);
      if (error.response) {
        console.error('[auth-slice] Error response:', error.response);
        return rejectWithValue(error.response.data || error.message);
      }
      return rejectWithValue(error.message || 'Error al enviar OTP');
    }
  },
);

export const updateMe = createAsyncThunk('auth/updateMe', async () => {
  const user = await fetchMe();
  await saveUser(user);
  return user;
});

export const updateUserInfo = createAsyncThunk(
  'auth/updateUserInfo',
  async (data: UpdateUserRequest, {rejectWithValue}) => {
    try {
      const user = await updateUserService(data);
      await saveUser(user);
      return user;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al actualizar la información',
      );
    }
  },
);

export const completeRegistration = createAsyncThunk(
  'auth/completeRegistration',
  async (data: CompleteRegistrationRequest, {rejectWithValue}) => {
    try {
      console.log('[AuthSlice] Starting complete registration');
      const response = await completeRegistrationService(data);
      console.log('[AuthSlice] Complete registration response received');

      if (!response || !response.user || !response.token) {
        console.error(
          '[AuthSlice] Invalid response from complete registration:',
          response,
        );
        await AuthStorage.clearAuthData();
        return rejectWithValue('Invalid response from server');
      }

      if (!isValidUser(response.user)) {
        console.error(
          '[AuthSlice] Invalid user data received from complete registration:',
          response.user,
        );
        await AuthStorage.clearAuthData();
        return rejectWithValue('Invalid user data received from server');
      }

      console.log('[AuthSlice] Saving auth data from complete registration');
      await AuthStorage.saveToken(response.token);
      await AuthStorage.saveUser(response.user);
      return response;
    } catch (err: any) {
      console.error('[AuthSlice] Error in complete registration:', {
        name: err.name,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      await AuthStorage.clearAuthData();

      // Handle Axios errors
      if (err.name === 'AxiosError') {
        if (err.response?.status === 401) {
          console.log(
            '[AuthSlice] 401 Unauthorized error in complete registration',
          );
          return rejectWithValue(
            'No autorizado. Por favor, verifica tus credenciales.',
          );
        }
        console.log(
          '[AuthSlice] Other Axios error in complete registration:',
          err.response?.data,
        );
        return rejectWithValue(
          err.response?.data?.message ||
            err.message ||
            'Error al completar el registro',
        );
      }

      // Handle other errors
      console.log('[AuthSlice] Non-Axios error in complete registration:', err);
      return rejectWithValue(err.message || 'Error al completar el registro');
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, {rejectWithValue}) => {
    try {
      await AuthStorage.clearAuthData();
      return true;
    } catch (err) {
      return rejectWithValue('Logout failed');
    }
  },
);

// Async thunk for manual token and user update
export const updateAuth = createAsyncThunk(
  'auth/updateAuth',
  async ({token, user}: {token: string; user: User}) => {
    await AuthStorage.saveToken(token);
    await AuthStorage.saveUser(user);
    return {token, user};
  },
);

// Async thunk to clear auth data from storage
export const clearAuthStorage = createAsyncThunk(
  'auth/clearAuthStorage',
  async () => {
    await AuthStorage.clearAuthData();
  },
);

// Add new thunk for handling session expiration
export const handleSessionExpiration = createAsyncThunk(
  'auth/handleSessionExpiration',
  async () => {
    await AuthStorage.clearAuthData();
    return true;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{token: string; user: User}>) => {
      if (
        !isValidUser(action.payload.user) ||
        !isValidToken(action.payload.token)
      ) {
        state.error = 'Invalid auth data';
        state.sessionExpired = true;
        return;
      }
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoggedIn = true;
      state.sessionExpired = false;
    },
    clearAuth: state => {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
      state.sessionExpired = false;
    },
    setSessionExpired: (state, action: PayloadAction<boolean>) => {
      state.sessionExpired = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Load auth state
      .addCase(loadAuth.pending, state => {
        state.isAutoLoginLoading = true;
        state.error = null;
      })
      .addCase(loadAuth.fulfilled, (state, action) => {
        // No validation - just set what's returned
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoggedIn = !!(action.payload.token && action.payload.user);
        state.sessionExpired = false;
        state.isAutoLoginLoading = false;
      })
      .addCase(loadAuth.rejected, state => {
        state.isAutoLoginLoading = false;
        state.token = null;
        state.user = null;
        state.isLoggedIn = false;
        state.sessionExpired = true;
      })
      // Login
      .addCase(login.pending, state => {
        console.log('[AuthSlice] Login pending');
        state.isLoading = true;
        state.error = null;
        state.isLoggedIn = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('[AuthSlice] Login fulfilled:', action.payload);
        if (!isValidUser(action.payload.user)) {
          console.log('[AuthSlice] Invalid user data in fulfilled');
          state.isLoading = false;
          state.isLoggedIn = false;
          state.error = 'Invalid user data received';
          return;
        }
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        console.log(
          '[AuthSlice] Login rejected:',
          action.payload || action.error,
        );
        state.isLoading = false;
        state.isLoggedIn = false;
        state.token = null;
        state.user = null;
        state.error =
          action.payload || action.error.message || 'Error al iniciar sesión';
      })
      // // Register
      // .addCase(register.pending, state => {
      //   state.isLoading = true;
      //   state.error = null;
      // })
      // .addCase(register.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   state.token = action.payload.token;
      //   state.user = action.payload.user;
      //   state.isLoggedIn = true;
      // })
      // .addCase(register.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.isLoggedIn = false;
      //   state.error = action.payload || action.error.message;
      // })
      .addCase(register.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registerEmail = action.payload.userEmail; // Guardar el email en el estado
        state.registerUserId = action.payload.userId;
        // state.token = action.payload.token;
        // state.user = action.payload.user;
        // state.userMe = action.payload.user;
        // state.isLoggedIn = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        if (action.payload) {
          state.error = action.payload.error;
        } else {
          state.error =
            action.error.message || 'Fallo en el registro de usuario';
        }
      })
      .addCase(verifyOtpUser.pending, state => {
        state.isLoading = true;
        state.errorOtp = null;
      })
      .addCase(verifyOtpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Solo guardar el token en el store (no hacer login completo)
        // No guardamos en storage todavía, solo en memoria para usar en el siguiente paso
        if (action.payload.token) {
          state.token = action.payload.token;
        }
        // No establecemos isLoggedIn = true todavía
        // No guardamos user todavía (el user vendrá después del proceso KYC)
        state.registerEmail = null;
      })
      .addCase(verifyOtpUser.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.errorOtp = action.payload.error;
        } else {
          state.errorOtp =
            action.error.message || 'Fallo en la verificación de OTP';
        }
      })
      .addCase(updateMe.fulfilled, (state, action) => {
        state.userMe = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(updateUserInfo.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userMe = action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Complete Registration
      .addCase(completeRegistration.pending, state => {
        console.log('[AuthSlice] Complete registration pending');
        state.isLoading = true;
        state.error = null;
        state.isLoggedIn = false;
      })
      .addCase(completeRegistration.fulfilled, (state, action) => {
        console.log(
          '[AuthSlice] Complete registration fulfilled:',
          action.payload,
        );
        if (!isValidUser(action.payload.user)) {
          console.log(
            '[AuthSlice] Invalid user data in complete registration fulfilled',
          );
          state.isLoading = false;
          state.isLoggedIn = false;
          state.error = 'Invalid user data received';
          return;
        }
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.userMe = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        console.log(
          '[AuthSlice] Complete registration rejected:',
          action.payload || action.error,
        );
        state.isLoading = false;
        state.isLoggedIn = false;
        state.token = null;
        state.user = null;
        state.error =
          action.payload ||
          action.error.message ||
          'Error al completar el registro';
      })
      // Logout
      .addCase(logout.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, state => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Logout failed';
      })
      // Update auth
      .addCase(updateAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoggedIn = true;
      })
      // Clear auth storage
      .addCase(clearAuthStorage.fulfilled, state => {
        state.token = null;
        state.user = null;
        state.isLoggedIn = false;
      })
      // Handle session expiration
      .addCase(handleSessionExpiration.fulfilled, state => {
        state.token = null;
        state.user = null;
        state.isLoggedIn = false;
        state.sessionExpired = true;
        state.error = 'Your session has expired. Please login again.';
      });
  },
});

export const {setAuth, clearAuth, setSessionExpired} = authSlice.actions;
export default authSlice.reducer;
