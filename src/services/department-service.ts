import { api } from '../config/api';
import type { Department } from '../types/models';
import { departmentFallbacks } from '../utils/department';

export async function listDepartments(): Promise<Department[]> {
  try {
    const response = await api.get<{ data: Department[] }>('/departments');
    return response.data.data;
  } catch {
    return departmentFallbacks;
  }
}

export async function getDepartmentStats(departmentId: number): Promise<Record<string, number>> {
  try {
    const response = await api.get(`/departments/${departmentId}/stats`);
    return response.data.data as Record<string, number>;
  } catch {
    return {};
  }
}

export async function updateDepartment(
  departmentId: number,
  payload: {
    departmentCode: string;
    departmentName: string;
    description?: string | null;
    isActive?: boolean;
  },
): Promise<Department> {
  const response = await api.put<{ data: Department }>(`/departments/${departmentId}`, payload);
  return response.data.data;
}
