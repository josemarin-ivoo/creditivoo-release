import axios from 'axios';
import {store} from '../../store/store';
import {RootState} from '../../store/store';
import {clearAuth} from '../../store/slices/auth-slice';
import {AuthStorage} from '../../app/services/AuthStorage';
//import Config from 'react-native-config';

//Local Host --> http://10.0.2.2:3000
//https://api.cuotaapp.com
//https://api-staging.cuotaapp.com

export const apiUrl = 'https://f822101d8945.ngrok.app';

const api = axios.create({
  baseURL: apiUrl + '/api',
});

api.interceptors.request.use(async config => {
  const state: RootState = store.getState();
  const token = state.auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 403) {
      store.dispatch(clearAuth());
      await AuthStorage.clearAuthData();
    }

    return Promise.reject(error);
  },
);

export default api;
