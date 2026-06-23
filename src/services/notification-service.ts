import { api } from '../config/api';

export async function registerPushToken(payload: {
  fcmToken: string;
  platform?: 'android';
  deviceId?: string | null;
}) {
  const response = await api.post('/notifications/register-token', payload);
  return response.data.data;
}

export async function removePushToken(fcmToken: string) {
  const response = await api.post('/notifications/remove-token', { fcmToken });
  return response.data.data;
}
