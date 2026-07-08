import type { Report } from '../types/models';

export const HISTORY_PAGE_SIZE = 10;

export function matchesReportSearch(report: Report, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const values = [
    report.reportId,
    report.description,
    report.incidentLocationText,
    report.department,
    report.sourceDepartment,
    report.status,
    report.reporter?.fullName,
    report.reporter?.email,
    report.assignedStaff?.fullName,
    report.assignedStaff?.email,
  ];

  return values
    .filter((value) => value != null)
    .some((value) => String(value).toLowerCase().includes(query));
}

export function getPageCount(totalItems: number, pageSize = HISTORY_PAGE_SIZE) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function getPaginatedItems<T>(items: T[], page: number, pageSize = HISTORY_PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
