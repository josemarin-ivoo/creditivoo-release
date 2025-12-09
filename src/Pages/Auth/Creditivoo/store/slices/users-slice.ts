import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '@services/api/auth';
import {
  SendUser,
  UserResponse,
  createUserApi,
  getUserByEmailApi,
  updateUserDocumentApi,
  updateUserSelfieApi,
} from '@services/api/users';

interface UserState {
  user: Partial<SendUser> | User;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  token: string | null;
  loadingUserSelfie: boolean;
  loadingUserDocument: boolean;
}

const initialState: UserState = {
  user: { phone: '+54 ' },
  status: 'idle',
  error: null,
  token: null,
  loadingUserSelfie: false,
  loadingUserDocument: false,
};

export const createUser = createAsyncThunk(
  'user/createUser',
  async (user: SendUser, { rejectWithValue }) => {
    try {
      const response = await createUserApi(user);
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  }
);

export const getUserByEmail = createAsyncThunk(
  'user/getUserByEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await getUserByEmailApi(email);
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateUserSelfie = createAsyncThunk(
  'user/updateUserSelfie',
  async (formData: any) => {
    try {
      const response = await updateUserSelfieApi(formData);
      return response;
    } catch (error) {
      console.error('Error uploading selfie:', error);
      throw error;
    }
  },
);

export const updateUserDocument = createAsyncThunk(
  'user/updateUserDocument',
  async (formData: any) => {
    try {
      const response = await updateUserDocumentApi(formData);
      return response;
    } catch (error) {
      console.error('Error uploading selfie:', error);
      throw error;
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser(state, action: PayloadAction<Partial<SendUser>>) {
      state.user = { ...state.user, ...action.payload };
    },
    clearUser: (state) => {
      state.token = null;
      state.user = { phone: '+54 ' };
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        createUser.fulfilled,
        (state, action: PayloadAction<UserResponse>) => {
          state.status = 'succeeded';
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.error = null;
        }
      )
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message || 'Failed to create user';
        }
      })
      .addCase(getUserByEmail.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        getUserByEmail.fulfilled,
        (state, action: PayloadAction<UserResponse>) => {
          state.status = 'succeeded';
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.error = null;
        }
      )
      .addCase(getUserByEmail.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message || 'Failed to fetch user by email';
        }
      })
      .addCase(updateUserSelfie.pending, state => {
        state.loadingUserSelfie = true;
      })
      .addCase(updateUserSelfie.fulfilled, state => {
        state.loadingUserSelfie = false;
      })
      .addCase(updateUserSelfie.rejected, state => {
        state.loadingUserSelfie = false;
      })
      .addCase(updateUserDocument.pending, state => {
        state.loadingUserDocument = true;
      })
      .addCase(updateUserDocument.fulfilled, state => {
        state.loadingUserDocument = false;
      })
      .addCase(updateUserDocument.rejected, state => {
        state.loadingUserDocument = false;
      });
  },
});

export const { updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
