import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AuthStorage} from '../../app/services/AuthStorage';
import {
  loginUser,
  LoginRequest,
  getMe,
  updateMe,
  UpdateMeRequest,
  changePassword,
  ChangePasswordRequest,
  refreshToken,
} from '../../services/auth';
import {RevisionResponse} from '../../services/credit';
import {setPurchases} from '../purchase-slice';

// User type based on what's returned from /auth/me
export interface User {
  id: number;
  name: string;
  lastname: string;
  fullname: string;
  email: string;
  phone: string;
  username: string;
  role: string;
  hasActiveCredit: boolean;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  creditStatus: string;
  pendingPayment: number | null;
  overduePayment: number | null;
  dob?: string | null;
  address?: string | null;
  gender?: string | null;
  enableFaceIdCheck?: boolean;
  enableBiometricCheck?: boolean;
  document?: string | null;
  purchasesIds?: RevisionResponse[] | null;
  createdAt?: string | null;
  customRoleId?: number | null;
  isFirstLogin?: boolean;
  lastCreditTransactionAt?: string | null;
  hasPurchasePendingInvoice?: boolean;
  hasPurchaseInProgress?: boolean;
  hasPassDuePayments?: boolean;
  outstandingBalance?: number | null;
  profilePictureUrl?: string | null;
  profilePictureS3Key?: string | null;
  profilePictureUpdatedAt?: string | null;
  documentType?: string | null;
  rawDocument?: string | null;
  isPlusUser?: boolean | null;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  isAutoLoginLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isLoading: false,
  isAutoLoginLoading: true, // Start as true to check auth on app start
  isLoggedIn: false,
  error: null,
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
  {token: string | null; refreshToken: string | null; user: User | null},
  void,
  {rejectValue: string}
>('auth/loadAuth', async () => {
  try {
    const token = await AuthStorage.getToken();
    const refreshTokenValue = await AuthStorage.getRefreshToken();
    const storedUser = await AuthStorage.getUser();

    // Convertir el User de AuthStorage al tipo User de ivoo
    const user: User | null = storedUser
      ? {
          id: storedUser.id,
          name: (storedUser as any).name || '',
          lastname: (storedUser as any).lastname || '',
          fullname: (storedUser as any).fullname || '',
          email: storedUser.email,
          phone: (storedUser as any).phone || '',
          username: (storedUser as any).username || storedUser.email,
          role: (storedUser as any).role || '',
          hasActiveCredit: (storedUser as any).hasActiveCredit || false,
          creditLimit: (storedUser as any).creditLimit || 0,
          creditUsed: (storedUser as any).creditUsed || 0,
          creditAvailable: (storedUser as any).creditAvailable || 0,
          creditStatus: (storedUser as any).creditStatus || '',
          pendingPayment: (storedUser as any).pendingPayment ?? null,
          overduePayment: (storedUser as any).overduePayment ?? null,
          dob: (storedUser as any).dob || null,
          address: (storedUser as any).address || null,
          gender: (storedUser as any).gender || null,
          enableFaceIdCheck:
            (storedUser as any).enableFaceIdCheck === true ? true : false,
          enableBiometricCheck:
            (storedUser as any).enableBiometricCheck === true ? true : false,
          document: (storedUser as any).document || null,
          purchasesIds: (storedUser as any).purchasesIds || null,
          createdAt: (storedUser as any).createdAt || null,
          customRoleId: (storedUser as any).customRoleId || null,
          isFirstLogin: (storedUser as any).isFirstLogin ?? false,
          lastCreditTransactionAt:
            (storedUser as any).lastCreditTransactionAt || null,
          hasPurchasePendingInvoice:
            (storedUser as any).hasPurchasePendingInvoice ?? false,
          hasPurchaseInProgress:
            (storedUser as any).hasPurchaseInProgress ?? false,
          hasPassDuePayments: (storedUser as any).hasPassDuePayments ?? false,
          outstandingBalance: (storedUser as any).outstandingBalance ?? null,
          profilePictureUrl: (storedUser as any).profilePictureUrl || null,
          profilePictureS3Key: (storedUser as any).profilePictureS3Key || null,
          profilePictureUpdatedAt:
            (storedUser as any).profilePictureUpdatedAt || null,
          documentType: (storedUser as any).documentType || null,
          rawDocument: (storedUser as any).rawDocument || null,
          isPlusUser: (storedUser as any).isPlusUser ?? null,
        }
      : null;

    return {
      token: token || null,
      refreshToken: refreshTokenValue || null,
      user,
    };
  } catch (error) {
    console.error('[IvoAuthSlice] Error loading auth state:', error);
    return {token: null, refreshToken: null, user: null};
  }
});

// Async thunk to update auth (used after registration)
export const updateAuth = createAsyncThunk(
  'auth/updateAuth',
  async ({
    token,
    refreshToken: refreshTokenValue,
    user,
  }: {
    token: string;
    refreshToken?: string;
    user: User;
  }) => {
    await AuthStorage.saveToken(token);
    if (refreshTokenValue) {
      await AuthStorage.saveRefreshToken(refreshTokenValue);
    }
    await AuthStorage.saveUser(user as any);
    return {
      token,
      refreshToken: refreshTokenValue || null,
      user,
    };
  },
);

// Async thunk to login
export const login = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, {rejectWithValue, dispatch}) => {
    try {
      console.log('[IvoAuthSlice] Iniciando login');
      const response = await loginUser(data);

      if (
        !response ||
        !response.user ||
        !response.token ||
        !response.refreshToken
      ) {
        console.error('[IvoAuthSlice] Respuesta inválida del servidor');
        await AuthStorage.clearAuthData();
        return rejectWithValue('Respuesta inválida del servidor');
      }

      // Guardar token, refreshToken y usuario
      console.log('[IvoAuthSlice] Guardando token y refresh token');
      console.log('[IvoAuthSlice] Token presente:', !!response.token);
      console.log(
        '[IvoAuthSlice] Refresh token presente:',
        !!response.refreshToken,
      );
      await AuthStorage.saveToken(response.token);
      await AuthStorage.saveRefreshToken(response.refreshToken);
      console.log('[IvoAuthSlice] Tokens guardados exitosamente');
      // Convertir el User del servicio al formato esperado
      const userData: User = {
        id: response.user.id,
        name: response.user.name || '',
        lastname: response.user.lastname || '',
        fullname:
          response.user.fullname ||
          `${response.user.name || ''} ${response.user.lastname || ''}`.trim(),
        email: response.user.email,
        phone: response.user.phone || '',
        username: response.user.username || response.user.email,
        role: response.user.role || '',
        hasActiveCredit: response.user.hasActiveCredit || false,
        creditLimit: response.user.creditLimit || 0,
        creditUsed: response.user.creditUsed || 0,
        creditAvailable: response.user.creditAvailable || 0,
        creditStatus: response.user.creditStatus || '',
        pendingPayment: (response.user as any).pendingPayment ?? null,
        overduePayment: (response.user as any).overduePayment ?? null,
        dob: (response.user as any).dob || null,
        address: (response.user as any).address || null,
        gender: (response.user as any).gender || null,
        enableFaceIdCheck:
          (response.user as any).enableFaceIdCheck === true ? true : false,
        enableBiometricCheck:
          (response.user as any).enableBiometricCheck === true ? true : false,
        document: (response.user as any).document || null,
        purchasesIds: (response.user as any).purchasesIds || null,
        createdAt: (response.user as any).createdAt || null,
        customRoleId: (response.user as any).customRoleId || null,
        isFirstLogin: (response.user as any).isFirstLogin ?? false,
        lastCreditTransactionAt:
          (response.user as any).lastCreditTransactionAt || null,
        hasPurchasePendingInvoice:
          (response as any).hasPurchasePendingInvoice ??
          (response.user as any)?.hasPurchasePendingInvoice ??
          false,
        hasPurchaseInProgress:
          (response as any).hasPurchaseInProgress ??
          (response.user as any)?.hasPurchaseInProgress ??
          false,
        hasPassDuePayments:
          (response as any).hasPassDuePayments ??
          (response.user as any)?.hasPassDuePayments ??
          false,
        outstandingBalance:
          (response as any).outstandingBalance ??
          (response.user as any)?.outstandingBalance ??
          null,
        profilePictureUrl: (response.user as any)?.profilePictureUrl || null,
        profilePictureS3Key:
          (response.user as any)?.profilePictureS3Key || null,
        profilePictureUpdatedAt:
          (response.user as any)?.profilePictureUpdatedAt || null,
        documentType: (response.user as any)?.documentType || null,
        rawDocument: (response.user as any)?.rawDocument || null,
        isPlusUser: (response.user as any)?.isPlusUser ?? null,
      };
      await AuthStorage.saveUser(userData as any);

      // Guardar credenciales si el usuario tiene biometría habilitada
      if (
        userData.enableFaceIdCheck === true ||
        userData.enableBiometricCheck === true
      ) {
        try {
          await AuthStorage.saveCredentials(data.email, data.password);
          console.log(
            '[IvoAuthSlice] Credenciales guardadas para login biométrico',
          );
        } catch (credError) {
          console.warn(
            '[IvoAuthSlice] Error al guardar credenciales:',
            credError,
          );
          // No fallar el login si no se pueden guardar las credenciales
        }
      }

      // Extraer purchases y hasPurchasePendingInvoice de la respuesta
      const purchases: RevisionResponse[] =
        (response as any).purchases || (response.user as any)?.purchases || [];
      const hasPurchasePendingInvoice: boolean =
        (response as any).hasPurchasePendingInvoice ??
        (response.user as any)?.hasPurchasePendingInvoice ??
        false;
      const hasPurchaseInProgress: boolean =
        (response as any).hasPurchaseInProgress ??
        (response.user as any)?.hasPurchaseInProgress ??
        false;

      // Setear purchases en el purchase slice
      dispatch(
        setPurchases({
          purchases,
          hasPurchasePendingInvoice,
          hasPurchaseInProgress,
        }),
      );

      return {
        token: response.token,
        refreshToken: response.refreshToken,
        user: userData,
        purchases,
        hasPurchasePendingInvoice,
        hasPurchaseInProgress,
      };
    } catch (error: any) {
      console.error('[IvoAuthSlice] ===== ERROR EN LOGIN =====');
      console.error('[IvoAuthSlice] Tipo de error:', error?.name || 'Unknown');
      console.error('[IvoAuthSlice] Mensaje de error:', error?.message);
      console.error('[IvoAuthSlice] Stack trace:', error?.stack);

      // Serializar error de forma segura para evitar problemas con Hermes
      try {
        const errorInfo = {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          response: error?.response
            ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              }
            : undefined,
        };
        console.error('[IvoAuthSlice] Error completo:', errorInfo);
      } catch (serializeError) {
        console.error('[IvoAuthSlice] Error al serializar:', serializeError);
      }

      await AuthStorage.clearAuthData();

      const errorMessage = error.message || 'Error al iniciar sesión';
      console.error('[IvoAuthSlice] Mensaje de error a mostrar:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

// Async thunk to logout
export const logout = createAsyncThunk('auth/logout', async (_, {dispatch}) => {
  await AuthStorage.clearAuthData();
  // Limpiar purchases al hacer logout
  dispatch(
    setPurchases({
      purchases: [],
      hasPurchasePendingInvoice: false,
      hasPurchaseInProgress: false,
    }),
  );
  return;
});

// Async thunk to fetch current user info
export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, {rejectWithValue, dispatch}) => {
    try {
      console.log('[IvoAuthSlice] Obteniendo información del usuario');
      const response = await getMe();

      if (!response || !response.user) {
        console.error('[IvoAuthSlice] Respuesta inválida del servidor');
        return rejectWithValue('Respuesta inválida del servidor');
      }

      // Guardar usuario actualizado en AuthStorage
      const userData: User = {
        id: response.user.id,
        name: response.user.name || '',
        lastname: response.user.lastname || '',
        fullname: response.user.fullname || '',
        email: response.user.email,
        phone: response.user.phone || '',
        username: response.user.username || '',
        role: response.user.role || '',
        hasActiveCredit: response.user.hasActiveCredit || false,
        creditLimit: response.user.creditLimit || 0,
        creditUsed: response.user.creditUsed || 0,
        creditAvailable: response.user.creditAvailable || 0,
        creditStatus: response.user.creditStatus || '',
        pendingPayment: (response.user as any).pendingPayment ?? null,
        overduePayment: (response.user as any).overduePayment ?? null,
        dob: (response.user as any).dob || null,
        address: (response.user as any).address || null,
        gender: (response.user as any).gender || null,
        enableFaceIdCheck:
          (response.user as any).enableFaceIdCheck === true ? true : false,
        enableBiometricCheck:
          (response.user as any).enableBiometricCheck === true ? true : false,
        document: (response.user as any).document || null,
        purchasesIds: (response.user as any).purchasesIds || null,
        createdAt: (response.user as any).createdAt || null,
        customRoleId: (response.user as any).customRoleId || null,
        isFirstLogin: (response.user as any).isFirstLogin ?? false,
        lastCreditTransactionAt:
          (response.user as any).lastCreditTransactionAt || null,
        hasPurchasePendingInvoice:
          (response as any).hasPurchasePendingInvoice ??
          (response.user as any)?.hasPurchasePendingInvoice ??
          false,
        hasPurchaseInProgress:
          (response as any).hasPurchaseInProgress ??
          (response.user as any)?.hasPurchaseInProgress ??
          false,
        hasPassDuePayments:
          (response as any).hasPassDuePayments ??
          (response.user as any)?.hasPassDuePayments ??
          false,
        outstandingBalance:
          (response as any).outstandingBalance ??
          (response.user as any)?.outstandingBalance ??
          null,
        profilePictureUrl: (response.user as any)?.profilePictureUrl || null,
        profilePictureS3Key:
          (response.user as any)?.profilePictureS3Key || null,
        profilePictureUpdatedAt:
          (response.user as any)?.profilePictureUpdatedAt || null,
        documentType: (response.user as any)?.documentType || null,
        rawDocument: (response.user as any)?.rawDocument || null,
        isPlusUser: (response.user as any)?.isPlusUser ?? null,
      };
      await AuthStorage.saveUser(userData as any);

      // Extraer purchases y hasPurchasePendingInvoice de la respuesta
      const purchases: RevisionResponse[] =
        (response as any).purchases || (response.user as any)?.purchases || [];
      const hasPurchasePendingInvoice: boolean =
        (response as any).hasPurchasePendingInvoice ??
        (response.user as any)?.hasPurchasePendingInvoice ??
        false;
      const hasPurchaseInProgress: boolean =
        (response as any).hasPurchaseInProgress ??
        (response.user as any)?.hasPurchaseInProgress ??
        false;

      // Setear purchases en el purchase slice
      dispatch(
        setPurchases({
          purchases,
          hasPurchasePendingInvoice,
          hasPurchaseInProgress,
        }),
      );

      return {
        user: userData,
        purchases,
        hasPurchasePendingInvoice,
        hasPurchaseInProgress,
      };
    } catch (error: any) {
      console.error(
        '[IvoAuthSlice] Error al obtener información del usuario:',
        error,
      );

      // Si es un error 401, limpiar datos de autenticación
      if (
        error.response?.status === 401 ||
        error.message?.includes('401') ||
        error.message?.includes('Unauthorized')
      ) {
        console.warn(
          '[IvoAuthSlice] Error 401 detectado, limpiando datos de autenticación',
        );
        try {
          await AuthStorage.clearAuthData();
        } catch (clearError) {
          console.error('[IvoAuthSlice] Error al limpiar datos:', clearError);
        }
      }

      return rejectWithValue(
        error.message || 'Error al obtener información del usuario',
      );
    }
  },
);

// Async thunk to update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (data: UpdateMeRequest, {rejectWithValue, dispatch}) => {
    try {
      console.log('[IvoAuthSlice] Actualizando perfil del usuario');
      const response = await updateMe(data);

      if (!response || !response.user) {
        console.error('[IvoAuthSlice] Respuesta inválida del servidor');
        return rejectWithValue('Respuesta inválida del servidor');
      }

      // Guardar usuario actualizado en AuthStorage
      const userData: User = {
        id: response.user.id,
        name: response.user.name || '',
        lastname: response.user.lastname || '',
        fullname: response.user.fullname || '',
        email: response.user.email,
        phone: response.user.phone || '',
        username: response.user.username || '',
        role: response.user.role || '',
        hasActiveCredit: response.user.hasActiveCredit || false,
        creditLimit: response.user.creditLimit || 0,
        creditUsed: response.user.creditUsed || 0,
        creditAvailable: response.user.creditAvailable || 0,
        creditStatus: response.user.creditStatus || '',
        pendingPayment: (response.user as any).pendingPayment ?? null,
        overduePayment: (response.user as any).overduePayment ?? null,
        dob: (response.user as any).dob || null,
        address: (response.user as any).address || null,
        gender: (response.user as any).gender || null,
        enableFaceIdCheck:
          (response.user as any).enableFaceIdCheck === true ? true : false,
        enableBiometricCheck:
          (response.user as any).enableBiometricCheck === true ? true : false,
        document: (response.user as any).document || null,
        purchasesIds: (response.user as any).purchasesIds || null,
        createdAt: (response.user as any).createdAt || null,
        customRoleId: (response.user as any).customRoleId || null,
        isFirstLogin: (response.user as any).isFirstLogin ?? false,
        lastCreditTransactionAt:
          (response.user as any).lastCreditTransactionAt || null,
        hasPurchasePendingInvoice:
          (response as any).hasPurchasePendingInvoice ??
          (response.user as any)?.hasPurchasePendingInvoice ??
          false,
        hasPurchaseInProgress:
          (response as any).hasPurchaseInProgress ??
          (response.user as any)?.hasPurchaseInProgress ??
          false,
        hasPassDuePayments:
          (response as any).hasPassDuePayments ??
          (response.user as any)?.hasPassDuePayments ??
          false,
        outstandingBalance:
          (response as any).outstandingBalance ??
          (response.user as any)?.outstandingBalance ??
          null,
        profilePictureUrl: (response.user as any)?.profilePictureUrl || null,
        profilePictureS3Key:
          (response.user as any)?.profilePictureS3Key || null,
        profilePictureUpdatedAt:
          (response.user as any)?.profilePictureUpdatedAt || null,
        documentType: (response.user as any)?.documentType || null,
        rawDocument: (response.user as any)?.rawDocument || null,
        isPlusUser: (response.user as any)?.isPlusUser ?? null,
      };
      await AuthStorage.saveUser(userData as any);

      // Extraer purchases y hasPurchasePendingInvoice de la respuesta
      const purchases: RevisionResponse[] =
        (response as any).purchases || (response.user as any)?.purchases || [];
      const hasPurchasePendingInvoice: boolean =
        (response as any).hasPurchasePendingInvoice ??
        (response.user as any)?.hasPurchasePendingInvoice ??
        false;
      const hasPurchaseInProgress: boolean =
        (response as any).hasPurchaseInProgress ??
        (response.user as any)?.hasPurchaseInProgress ??
        false;

      // Setear purchases en el purchase slice
      dispatch(
        setPurchases({
          purchases,
          hasPurchasePendingInvoice,
          hasPurchaseInProgress,
        }),
      );

      return {
        user: userData,
        purchases,
        hasPurchasePendingInvoice,
        hasPurchaseInProgress,
      };
    } catch (error: any) {
      console.error('[IvoAuthSlice] Error al actualizar perfil:', error);
      return rejectWithValue(error.message || 'Error al actualizar perfil');
    }
  },
);

// Async thunk to change password
export const changeUserPassword = createAsyncThunk(
  'auth/changePassword',
  async (data: ChangePasswordRequest, {rejectWithValue}) => {
    try {
      console.log('[IvoAuthSlice] Cambiando contraseña del usuario');
      const response = await changePassword(data);

      if (!response || !response.success) {
        console.error('[IvoAuthSlice] Respuesta inválida del servidor');
        return rejectWithValue(
          response?.message || 'Error al cambiar contraseña',
        );
      }

      return response;
    } catch (error: any) {
      console.error('[IvoAuthSlice] Error al cambiar contraseña:', error);
      return rejectWithValue(error.message || 'Error al cambiar contraseña');
    }
  },
);

// Async thunk to refresh token
export const refreshUserToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, {rejectWithValue, getState}) => {
    try {
      console.log('[IvoAuthSlice] Refrescando token');
      const state = getState() as any;
      const currentRefreshToken = state.auth.refreshToken;

      if (!currentRefreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await refreshToken(currentRefreshToken);

      if (!response || !response.token || !response.refreshToken) {
        console.error('[IvoAuthSlice] Respuesta inválida del servidor');
        await AuthStorage.clearAuthData();
        return rejectWithValue('Respuesta inválida del servidor');
      }

      // Guardar nuevos tokens
      await AuthStorage.saveToken(response.token);
      await AuthStorage.saveRefreshToken(response.refreshToken);

      return {
        token: response.token,
        refreshToken: response.refreshToken,
      };
    } catch (error: any) {
      console.error('[IvoAuthSlice] Error al refrescar token:', error);
      await AuthStorage.clearAuthData();
      return rejectWithValue(error.message || 'Error al refrescar token');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{token: string; refreshToken?: string; user: User}>,
    ) => {
      if (
        !isValidUser(action.payload.user) ||
        !isValidToken(action.payload.token)
      ) {
        state.error = 'Invalid auth data';
        return;
      }
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.user = action.payload.user;
      state.isLoggedIn = true;
      state.error = null;
    },
    clearAuth: state => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
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
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isLoggedIn = !!(action.payload.token && action.payload.user);
        state.isAutoLoginLoading = false;
      })
      .addCase(loadAuth.rejected, state => {
        state.isAutoLoginLoading = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isLoggedIn = false;
      })
      // Update auth
      .addCase(updateAuth.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(updateAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error updating auth';
      })
      // Login
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.error = (action.payload as string) || 'Error al iniciar sesión';
      })
      // Logout
      .addCase(logout.pending, state => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.isLoading = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
        // Las purchases se limpian en el purchase slice mediante dispatch en el thunk
      })
      .addCase(logout.rejected, state => {
        state.isLoading = false;
        state.error = 'Error al cerrar sesión';
      })
      // Fetch me
      .addCase(fetchMe.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.isLoading = false;
        // Si es un error 401, limpiar el estado de autenticación
        const errorMessage = (action.payload as string) || '';
        if (
          errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('Token')
        ) {
          state.token = null;
          state.refreshToken = null;
          state.user = null;
          state.isLoggedIn = false;
        }
        state.error =
          errorMessage || 'Error al obtener información del usuario';
      })
      // Update user profile
      .addCase(updateUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || 'Error al actualizar perfil';
      })
      // Change password
      .addCase(changeUserPassword.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || 'Error al cambiar contraseña';
      })
      // Refresh token
      .addCase(refreshUserToken.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        state.isLoading = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isLoggedIn = false;
        state.error = (action.payload as string) || 'Error al refrescar token';
      });
  },
});

export const {setAuth, clearAuth} = authSlice.actions;
export default authSlice.reducer;
