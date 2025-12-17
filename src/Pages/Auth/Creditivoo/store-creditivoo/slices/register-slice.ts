import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  registerUser as registerUserService,
  RegisterRequest,
} from '../../services';
import {AuthStorage} from '../../app/services/AuthStorage';

// Tipos para el estado de registro
export interface RegisterState {
  phoneNumber: string | null;
  email: string | null;
  password: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RegisterState = {
  phoneNumber: null,
  email: null,
  password: null,
  isLoading: false,
  error: null,
};

// Async thunk para registrar usuario
export const registerUser = createAsyncThunk(
  'register/registerUser',
  async (data: RegisterRequest, {rejectWithValue}) => {
    try {
      // Validar que todos los datos estén presentes
      if (!data.phoneNumber || !data.email || !data.password) {
        const missingFields = [];
        if (!data.phoneNumber) {
          missingFields.push('phoneNumber');
        }
        if (!data.email) {
          missingFields.push('email');
        }
        if (!data.password) {
          missingFields.push('password');
        }
        throw new Error(`Faltan datos requeridos: ${missingFields.join(', ')}`);
      }

      console.log('[RegisterSlice] ===== ENVIANDO REGISTRO FINAL =====');
      console.log('[RegisterSlice] Phone Number:', data.phoneNumber);
      console.log('[RegisterSlice] Email:', data.email);
      console.log('[RegisterSlice] Password:', '*** (oculto)');

      // Usar el servicio de autenticación
      const response = await registerUserService(data);

      console.log('[RegisterSlice] ===== REGISTRO EXITOSO =====');
      console.log('[RegisterSlice] Respuesta del servidor:', {
        userId: response.user?.id,
        email: response.user?.email,
        token: response.token ? '***' : 'no token',
      });

      // Validar que la respuesta tenga token, refreshToken y usuario
      if (!response.token || !response.refreshToken || !response.user) {
        throw new Error(
          'Respuesta inválida del servidor: faltan token, refreshToken o usuario',
        );
      }

      // Guardar token, refreshToken y usuario
      console.log(
        '[RegisterSlice] Guardando token, refreshToken y datos del usuario',
      );
      await AuthStorage.saveToken(response.token);
      await AuthStorage.saveRefreshToken(response.refreshToken);
      await AuthStorage.saveUser(response.user);

      return response;
    } catch (error: any) {
      console.error('[RegisterSlice] Error al registrar:', error);
      const errorMessage = error.message || 'Error al registrar usuario';
      return rejectWithValue(errorMessage);
    }
  },
);

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload;
      state.error = null;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
      state.error = null;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
      state.error = null;
    },
    clearRegisterData: state => {
      state.phoneNumber = null;
      state.email = null;
      state.password = null;
      state.error = null;
      state.isLoading = false;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
        // Limpiar datos después de registro exitoso
        state.phoneNumber = null;
        state.email = null;
        state.password = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPhoneNumber,
  setEmail,
  setPassword,
  clearRegisterData,
  clearError,
} = registerSlice.actions;

export default registerSlice.reducer;
