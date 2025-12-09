import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {User} from '@services/api/auth';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'user';

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

  async saveUser(user: User): Promise<void> {
    if (!isValidUser(user)) {
      throw new Error('Invalid user data provided');
    }
    try {
      const userString = JSON.stringify(user);
      await AsyncStorage.setItem(USER_KEY, userString);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error; // Propagate error to handle it in the calling code
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem(USER_KEY);
      if (!userString) return null;

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
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error; // Propagate error to handle it in the calling code
    }
  },

  async clearAuthData(): Promise<void> {
    try {
      await Promise.all([this.deleteToken(), this.deleteUser()]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error; // Propagate error to handle it in the calling code
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
};
