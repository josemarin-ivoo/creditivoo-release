import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'user';
const RANDOM_ID_KEY = 'randomId';

export const saveToken = async (token: string) => {
  await Keychain.setGenericPassword(TOKEN_KEY, token);
};

export const getToken = async () => {
  const credentials = await Keychain.getGenericPassword();
  return credentials ? credentials.password : null;
};

export const deleteToken = async () => {
  await Keychain.resetGenericPassword();
};

export const saveUser = async (user: object) => {
  const userString = JSON.stringify(user);
  await AsyncStorage.setItem(USER_KEY, userString);
};

export const getUser = async () => {
  const userString = await AsyncStorage.getItem(USER_KEY);
  return userString ? JSON.parse(userString) : null;
};

export const deleteUser = async () => {
  await AsyncStorage.removeItem(USER_KEY);
};

export const saveRandomId = async (randomId: string) => {
  await AsyncStorage.setItem(RANDOM_ID_KEY, randomId);
};

export const getRandomId = async () => {
  return await AsyncStorage.getItem(RANDOM_ID_KEY);
};

export const deleteRandomId = async () => {
  await AsyncStorage.removeItem(RANDOM_ID_KEY);
};
