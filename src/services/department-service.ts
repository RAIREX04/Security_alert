import { api } from '../config/api';
import type { Department } from '../types/models';

export async function listDepartments(): Promise<Department[]> {
  const response = await api.get<{ data: Department[] }>('/departments');
  return response.data.data;
}

export async function getDepartmentStats(departmentId: number): Promise<Record<string, number>> {
  const response = await api.get(`/departments/${departmentId}/stats`);
  return response.data.data as Record<string, number>;
}
