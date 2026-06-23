import { api } from '../config/api';
import type { AuthSession, User } from '../types/models';

export async function login(username: string, pin: string): Promise<AuthSession> {
  const response = await api.post<{ data: AuthSession }>('/auth/login', {
    username,
    pin,
  });
  return response.data.data;
}

export async function registerUser(payload: {
  fullName: string;
  username: string;
  email?: string | null;
  pin: string;
  phoneNumber?: string | null;
  photoUrl?: string | null;
}): Promise<unknown> {
  const response = await api.post('/auth/register-user', payload);
  return response.data;
}

export async function registerStaff(payload: {
  fullName: string;
  username: string;
  email?: string | null;
  pin: string;
  departmentId: number;
  phoneNumber?: string | null;
  photoUrl?: string | null;
}): Promise<unknown> {
  const response = await api.post('/auth/register-staff', payload);
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<{ data: User }>('/auth/me');
  return response.data.data;
}

export async function refreshToken(refreshToken: string): Promise<AuthSession> {
  const response = await api.post<{ data: AuthSession }>('/auth/refresh', {
    refreshToken,
  });
  return response.data.data;
}
