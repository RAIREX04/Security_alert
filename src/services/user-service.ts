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
  const response = await api.put<{ data: User }>(`/users/${userId}`, payload);
  return response.data.data;
}

export async function createUser(payload: {
  fullName: string;
  username: string;
  email?: string | null;
  pin: string;
  roleName: 'staff' | 'user';
  departmentId?: number | null;
  phoneNumber?: string | null;
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
  const response = await api.put<{ data: User }>('/users/me', payload);
  return response.data.data;
}

export async function deleteUser(userId: number): Promise<void> {
  await api.delete(`/users/${userId}`);
}

export async function getUserFormOptions(): Promise<UserFormOptions> {
  const response = await api.get<{ data: UserFormOptions }>('/users/options');
  return response.data.data;
}

export async function approveUser(userId: number): Promise<User> {
  const response = await api.patch<{ data: User }>(`/users/${userId}/approve`, {});
  return response.data.data;
}

export async function rejectUser(userId: number): Promise<User> {
  const response = await api.patch<{ data: User }>(`/users/${userId}/reject`, {});
  return response.data.data;
}

export async function getProfileSummary(): Promise<{
  reportsHandled: number;
  reportsCreated: number;
}> {
  const response = await api.get<{ data: { reportsHandled: number; reportsCreated: number } }>('/users/me/summary');
  return response.data.data;
}
