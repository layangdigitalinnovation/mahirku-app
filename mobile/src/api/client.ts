import axios from 'axios';
import { Platform, NativeModules } from 'react-native';

const getDevHost = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  if (!scriptURL) return null;
  const match = scriptURL.match(/\/\/(.*):\d+/);
  return match ? match[1] : null;
};

const getDevSettingsHost = () => {
  try {
    const dev = (NativeModules as any)?.DevSettings?.getConstants?.();
    const serverHost = dev?.serverHost as string | undefined;
    if (!serverHost) return null;
    const host = serverHost.split(':')[0];
    return host || null;
  } catch {
    return null;
  }
};

const getExpoDebuggerHost = () => {
  try {
    const Constants = require('expo-constants').default;
    const h = Constants?.debuggerHost || Constants?.expoConfig?.hostUri;
    if (!h) return null;
    const host = String(h).split(':')[0];
    return host || null;
  } catch {
    return null;
  }
};

const resolveBaseURL = () => {
  const envUrl = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL as string | undefined;
  if (envUrl) return envUrl;
  const host = getDevHost() || getDevSettingsHost() || getExpoDebuggerHost();
  if (Platform.OS === 'android') {
    if (!host || host === 'localhost' || host === '127.0.0.1') {
      return 'http://10.0.2.2:5000';
    }
    return `http://${host}:5000`;
  }
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return `http://${host}:5000`;
};

const baseURL = resolveBaseURL();
try {
  console.log('API baseURL resolved to', baseURL);
  console.log('Dev host from scriptURL', NativeModules.SourceCode?.scriptURL);
} catch {}
export const resolvedBaseURL = baseURL;

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  try {
    console.log('API request', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
    });
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      console.log('API error', {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status: error.response?.status,
        data: error.response?.data,
      });
    } catch {}
    return Promise.reject(error);
  }
);

export const setAuthToken = (token?: string) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};
