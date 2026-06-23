import { api } from '../config/api';
import type { Report } from '../types/models';

export async function listReports(params?: {
  status?: string;
  departmentId?: number;
  q?: string;
}): Promise<Report[]> {
  const response = await api.get<{ data: Report[] }>('/reports', { params });
  return response.data.data;
}

export async function listReportsByUser(userId: number): Promise<Report[]> {
  const response = await api.get<{ data: Report[] }>(`/reports/user/${userId}`);
  return response.data.data;
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
  const response = await api.patch<{ data: Report }>(`/reports/${reportId}/status`, {
    status,
  });
  return response.data.data;
}

export async function startProgress(
  reportId: number,
  payload: { assignedStaffId?: number | null; responderLocation?: string | null },
): Promise<Report> {
  const response = await api.patch<{ data: Report }>(`/reports/${reportId}/progress`, payload);
  return response.data.data;
}

export async function markArrived(
  reportId: number,
  payload: { assignedStaffId?: number | null; responderLocation?: string | null },
): Promise<Report> {
  const response = await api.patch<{ data: Report }>(`/reports/${reportId}/arrived`, payload);
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
  const response = await api.patch<{ data: Report }>(`/reports/${reportId}/complete`, payload);
  return response.data.data;
}

export async function rateReport(
  reportId: number,
  payload: { ratingScore: number; ratingComment?: string | null; reviewerType?: 'requester' | 'staff' },
): Promise<Report> {
  const response = await api.patch<{ data: Report }>(`/reports/${reportId}/rate`, payload);
  return response.data.data;
}

export async function deleteReport(reportId: number): Promise<void> {
  await api.delete(`/reports/${reportId}`);
}
