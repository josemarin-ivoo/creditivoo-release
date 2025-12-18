import EncryptedStorage from 'react-native-encrypted-storage';
import * as Keychain from 'react-native-keychain';
import {User} from '../../store-creditivoo/slices/auth-slice';

const TOKEN_KEY = 'userToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const CREDENTIALS_KEY = 'userCredentials';

// Helper function to validate user data
const isValidUser = (user: any): user is User => {
  return user && typeof user === 'object' && 'id' in user && 'email' in user;
};

export const AuthStorage = {
  async saveToken(token: string): Promise<void> {
    if (!token) {
      throw new Error('Invalid token provided');
    }
    try {
      await Keychain.setGenericPassword(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error; // Propagate error to handle it in the calling code
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword();
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async deleteToken(): Promise<void> {
    try {
      await Keychain.resetGenericPassword();
    } catch (error) {
      console.error('Error deleting token:', error);
      throw error; // Propagate error to handle it in the calling code
    }
  },

  async saveRefreshToken(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new Error('Invalid refresh token provided');
    }
    try {
      await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await EncryptedStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  async deleteRefreshToken(): Promise<void> {
    try {
      await EncryptedStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error deleting refresh token:', error);
      throw error;
    }
  },

  async saveUser(user: User): Promise<void> {
    if (!isValidUser(user)) {
      throw new Error('Invalid user data provided');
    }
    try {
      const userString = JSON.stringify(user);
      await EncryptedStorage.setItem(USER_KEY, userString);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error; // Propagate error to handle it in the calling code
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userString = await EncryptedStorage.getItem(USER_KEY);
      if (!userString) {
        return null;
      }

      const user = JSON.parse(userString);
      if (!isValidUser(user)) {
        // If stored user data is invalid, clear it
        await this.deleteUser();
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      // If there's an error parsing the user data, clear it
      await this.deleteUser();
      return null;
    }
  },

  async deleteUser(): Promise<void> {
    try {
      await EncryptedStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error; // Propagate error to handle it in the calling code
    }
  },

  async clearAuthData(): Promise<void> {
    try {
      // No eliminamos las credenciales aquí para permitir login biométrico después del logout
      await Promise.all([
        this.deleteToken(),
        this.deleteRefreshToken(),
        this.deleteUser(),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error; // Propagate error to handle it in the calling code
    }
  },

  async clearAllAuthData(): Promise<void> {
    try {
      // Esta función elimina TODO incluyendo credenciales (usar cuando se cambia contraseña, etc.)
      await Promise.all([
        this.deleteToken(),
        this.deleteRefreshToken(),
        this.deleteUser(),
        this.deleteCredentials(),
      ]);
    } catch (error) {
      console.error('Error clearing all auth data:', error);
      throw error;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();
      return !!token && isValidUser(user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  async saveCredentials(email: string, password: string): Promise<void> {
    try {
      const credentials = {email, password};
      const credentialsString = JSON.stringify(credentials);
      await EncryptedStorage.setItem(CREDENTIALS_KEY, credentialsString);
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw error;
    }
  },

  async getCredentials(): Promise<{email: string; password: string} | null> {
    try {
      const credentialsString = await EncryptedStorage.getItem(CREDENTIALS_KEY);
      if (!credentialsString) {
        return null;
      }
      const credentials = JSON.parse(credentialsString);
      if (
        credentials &&
        typeof credentials.email === 'string' &&
        typeof credentials.password === 'string'
      ) {
        return credentials;
      }
      return null;
    } catch (error) {
      console.error('Error getting credentials:', error);
      return null;
    }
  },

  async deleteCredentials(): Promise<void> {
    try {
      await EncryptedStorage.removeItem(CREDENTIALS_KEY);
    } catch (error) {
      console.error('Error deleting credentials:', error);
      throw error;
    }
  },
};
