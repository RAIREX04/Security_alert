import Constants from 'expo-constants';

const isAndroidEmulator = Constants.isDevice === false;

function readTrimmedEnv(value: string | undefined) {
  return value?.trim() || '';
}

function resolveApiBaseUrl() {
  const genericBase = readTrimmedEnv(process.env.EXPO_PUBLIC_API_BASE_URL);
  const emulatorBase = readTrimmedEnv(process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID_EMULATOR);
  const deviceBase = readTrimmedEnv(process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID_DEVICE);

  if (isAndroidEmulator) {
    return emulatorBase || genericBase || 'http://localhost:3000/api';
  }

  if (genericBase || deviceBase) {
    return deviceBase || genericBase || 'http://localhost:3000/api';
  }

  return 'http://localhost:3000/api';
}

export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV?.trim() || 'development',
  apiBaseUrl: resolveApiBaseUrl(),
  apiFallbackUrl: process.env.EXPO_PUBLIC_API_FALLBACK_URL?.trim() || '',
  appName: 'Security Alert',
};
