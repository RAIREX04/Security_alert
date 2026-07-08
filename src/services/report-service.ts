import axios from 'axios';
import { api } from '../config/api';
import { isLikelyNetworkError } from '../utils/network-error';
import {
  cacheReports,
  getDepartmentReportsCacheKey,
  getUserReportsCacheKey,
  readCachedReports,
} from './report-cache-service';
import type { Report } from '../types/models';

function isUnsupportedMutationEndpoint(error: unknown) {
  return axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 405);
}

export async function listReports(params?: {
  status?: string;
  departmentId?: number;
  q?: string;
}): Promise<Report[]> {
  const cacheKey = getDepartmentReportsCacheKey(params);
  try {
    const response = await api.get<{ data: Report[] }>('/reports', { params });
    const reports = response.data.data;
    await cacheReports(cacheKey, reports);
    return reports;
  } catch (error) {
    if (!isLikelyNetworkError(error)) {
      throw error;
    }

    return readCachedReports(cacheKey);
  }
}

export async function listReportsByUser(userId: number): Promise<Report[]> {
  const cacheKey = getUserReportsCacheKey(userId);
  try {
    const response = await api.get<{ data: Report[] }>(`/reports/user/${userId}`);
    const reports = response.data.data;
    await cacheReports(cacheKey, reports);
    return reports;
  } catch (error) {
    if (!isLikelyNetworkError(error)) {
      throw error;
    }

    return readCachedReports(cacheKey);
  }
}

export async function getReport(reportId: number): Promise<Report> {
  const response = await api.get<{ data: Report }>(`/reports/${reportId}`);
  return response.data.data;
}

export async function createReport(payload: {
  departmentId: number;
  sourceDepartmentId?: number | null;
  description: string;
  incidentLocationText: string;
  incidentLatitude?: number | null;
  incidentLongitude?: number | null;
  clientSubmissionId?: string | null;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    mimeType?: string | null;
    fileSize?: number | null;
    attachmentType: 'incident_photo';
  }>;
}): Promise<Report> {
  const response = await api.post<{ data: Report }>('/reports', payload);
  return response.data.data;
}

export async function updateReportStatus(reportId: number, status: string): Promise<Report> {
  const payload = { status };
  const response = await runReportMutationFallback([
    () => api.post<{ data: Report }>(`/reports/${reportId}/status`, payload),
    () => api.post<{ data: Report }>(`/reports/${reportId}/update-status`, payload),
    () => api.post<{ data: Report }>(`/reports/${reportId}/status`, payload, {
      headers: { 'X-HTTP-Method-Override': 'PATCH' },
    }),
    () => api.put<{ data: Report }>(`/reports/${reportId}/status`, payload),
    () => api.patch<{ data: Report }>(`/reports/${reportId}/status`, payload),
  ]);
  return response.data.data;
}

export async function startProgress(
  reportId: number,
  payload: { assignedStaffId?: number | null; responderLocation?: string | null },
): Promise<Report> {
  const response = await runReportMutationFallback([
    () => api.post<{ data: Report }>(`/reports/${reportId}/progress`, payload),
    () => api.post<{ data: Report }>(`/reports/${reportId}/start-progress`, payload),
    () => api.post<{ data: Report }>(`/reports/${reportId}/progress`, payload, {
      headers: { 'X-HTTP-Method-Override': 'PATCH' },
    }),
    () => api.post<{ data: Report }>(`/reports/${reportId}/status`, { status: 'progress' }),
    () => api.put<{ data: Report }>(`/reports/${reportId}/progress`, payload),
    () => api.patch<{ data: Report }>(`/reports/${reportId}/status`, { status: 'progress' }),
    () => api.patch<{ data: Report }>(`/reports/${reportId}/progress`, payload),
  ]);
  return response.data.data;
}

export async function markArrived(
  reportId: number,
  payload: { assignedStaffId?: number | null; responderLocation?: string | null },
): Promise<Report> {
  const response = await runReportMutationFallback([
    () => api.post<{ data: Report }>(`/reports/${reportId}/arrived`, payload),
    () => api.post<{ data: Report }>(`/reports/${reportId}/arrived`, payload, {
      headers: { 'X-HTTP-Method-Override': 'PATCH' },
    }),
    () => api.put<{ data: Report }>(`/reports/${reportId}/arrived`, payload),
    () => api.patch<{ data: Report }>(`/reports/${reportId}/arrived`, payload),
  ]);
  return response.data.data;
}

export async function completeReport(
  reportId: number,
  payload: {
    completionDescription: string;
    responderLocation?: string | null;
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      mimeType?: string | null;
      fileSize?: number | null;
      attachmentType: 'completion_photo';
    }>;
  },
): Promise<Report> {
  const response = await runReportMutationFallback([
    () => api.post<{ data: Report }>(`/reports/${reportId}/complete`, payload),
    () => api.post<{ data: Report }>(`/reports/${reportId}/complete`, payload, {
      headers: { 'X-HTTP-Method-Override': 'PATCH' },
    }),
    () => api.put<{ data: Report }>(`/reports/${reportId}/complete`, payload),
    () => api.patch<{ data: Report }>(`/reports/${reportId}/complete`, payload),
  ]);
  return response.data.data;
}

export async function rateReport(
  reportId: number,
  payload: { ratingScore: number; ratingComment?: string | null; reviewerType?: 'requester' | 'staff' },
): Promise<Report> {
  const response = await runReportMutationFallback([
    () => api.post<{ data: Report }>(`/reports/${reportId}/rate`, payload),
    () => api.post<{ data: Report }>(`/reports/${reportId}/rate`, payload, {
      headers: { 'X-HTTP-Method-Override': 'PATCH' },
    }),
    () => api.put<{ data: Report }>(`/reports/${reportId}/rate`, payload),
    () => api.patch<{ data: Report }>(`/reports/${reportId}/rate`, payload),
  ]);
  return response.data.data;
}

export async function deleteReport(reportId: number): Promise<void> {
  await api.delete(`/reports/${reportId}`);
}

async function runReportMutationFallback<T>(attempts: Array<() => Promise<T>>) {
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      if (!isUnsupportedMutationEndpoint(error)) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError;
}
