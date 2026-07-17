import axios from 'axios';
import { api } from '../config/api';
import type { User } from '../types/models';

export type UserFormOptions = {
  roles: Array<{ roleId: number; roleName: string }>;
  departments: Array<{ departmentId: number; departmentName: string }>;
};

export async function listUsers(params?: {
  role?: string;
  q?: string;
  departmentId?: number;
  approvalStatus?: string;
}): Promise<User[]> {
  const response = await api.get<{ data: User[] }>('/users', { params });
  return response.data.data;
}

export async function getUser(userId: number): Promise<User> {
  const response = await api.get<{ data: User }>(`/users/${userId}`);
  return response.data.data;
}

export async function updateUser(userId: number, payload: Partial<User> & { pin?: string }): Promise<User> {
  const path = `/users/${userId}`;
  const response = await writeUserWithFallback(path, payload);
  return response.data.data;
}

export async function createUser(payload: {
  fullName: string;
  username: string;
  email?: string | null;
  pin: string;
  roleName: 'superadmin' | 'admin' | 'staff' | 'user' | 'view_only';
  departmentId?: number | null;
  phoneNumber?: string | null;
  photoUrl?: string | null;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}): Promise<User> {
  const response = await api.post<{ data: User }>('/users', payload);
  return response.data.data;
}

export async function updateMe(payload: {
  fullName?: string;
  username?: string;
  email?: string;
  pin?: string;
  phoneNumber?: string | null;
  photoUrl?: string | null;
}): Promise<User> {
  const response = await writeUserWithFallback('/users/me', payload);
  return response.data.data;
}

function isUnsupportedWriteMethod(error: unknown) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  return status === 404 || status === 405;
}

async function writeUserWithFallback(path: string, payload: unknown) {
  const attempts = [
    () => api.post<{ data: User }>(path, payload),
    () => api.post<{ data: User }>(`${path}/update`, payload),
    () => api.post<{ data: User }>(path, payload, { headers: { 'X-HTTP-Method-Override': 'PUT' } }),
    () => api.patch<{ data: User }>(path, payload),
    () => api.put<{ data: User }>(path, payload),
  ];

  return runUnsupportedMethodFallback(attempts);
}

export async function deleteUser(userId: number): Promise<void> {
  await api.delete(`/users/${userId}`);
}

export async function getUserFormOptions(): Promise<UserFormOptions> {
  const response = await api.get<{ data: UserFormOptions }>('/users/options');
  return response.data.data;
}

export async function approveUser(userId: number): Promise<User> {
  return writeUserActionWithFallback(userId, 'approve', {
    approvalStatus: 'approved',
    isActive: true,
  });
}

export async function rejectUser(userId: number): Promise<User> {
  return writeUserActionWithFallback(userId, 'reject', {
    approvalStatus: 'rejected',
    isActive: false,
  });
}

async function writeUserActionWithFallback(
  userId: number,
  action: 'approve' | 'reject',
  fallbackPayload: Partial<User>,
) {
  const path = `/users/${userId}/${action}`;
  const attempts = [
    () => api.post<{ data: User }>(path, {}),
    () => api.post<{ data: User }>(path, {}, { headers: { 'X-HTTP-Method-Override': 'PATCH' } }),
    () => api.put<{ data: User }>(path, {}),
    () => api.post<{ data: User }>(`/users/${userId}`, fallbackPayload),
    () => api.post<{ data: User }>(`/users/${userId}/update`, fallbackPayload),
    () => api.patch<{ data: User }>(path, {}),
  ];

  try {
    const response = await runUnsupportedMethodFallback(attempts);
    return response.data.data;
  } catch (error) {
    if (!isUnsupportedWriteMethod(error)) {
      throw error;
    }
  }

  return updateUser(userId, fallbackPayload);
}

async function runUnsupportedMethodFallback<T>(attempts: Array<() => Promise<T>>) {
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      if (!isUnsupportedWriteMethod(error)) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError;
}

export async function getProfileSummary(): Promise<{
  reportsHandled: number;
  reportsCreated: number;
}> {
  const response = await api.get<{ data: { reportsHandled: number; reportsCreated: number } }>('/users/me/summary');
  return response.data.data;
}
