import type { Department, Report } from '../types/models';
import { departmentFallbacks, normalizeDepartmentName } from './department';

export type StaffDepartmentTheme = {
  color: string;
  soft: string;
  softer: string;
  border: string;
  ink: string;
  icon: string;
  title: string;
};

const themeByCode: Record<string, StaffDepartmentTheme> = {
  'ALERT SECURITY': {
    color: '#1D4ED8',
    soft: '#EAF2FF',
    softer: '#F5F8FF',
    border: '#D8E7FF',
    ink: '#123C8C',
    icon: 'S',
    title: 'ALERT SECURITY',
  },
  'ALERT FIRE STATION': {
    color: '#DC2626',
    soft: '#FFF0F0',
    softer: '#FFF8F8',
    border: '#F6D2D2',
    ink: '#B91C1C',
    icon: 'F',
    title: 'ALERT FIRE STATION',
  },
  'ALERT MEDICAL': {
    color: '#059669',
    soft: '#ECFBF4',
    softer: '#F5FFFA',
    border: '#CDEFD9',
    ink: '#047857',
    icon: 'M',
    title: 'ALERT MEDICAL',
  },
  'IT HELPDESK': {
    color: '#EA580C',
    soft: '#FFF5EC',
    softer: '#FFF9F2',
    border: '#F6DEC2',
    ink: '#C2410C',
    icon: 'IT',
    title: 'IT HELPDESK',
  },
};

export function getDepartmentById(departmentId?: number | null) {
  if (!departmentId) return departmentFallbacks[0];
  return departmentFallbacks.find((item) => item.departmentId === departmentId) ?? departmentFallbacks[0];
}

export function getDepartmentByName(name?: string | null) {
  if (!name) return departmentFallbacks[0];
  const normalized = normalizeDepartmentName(name);
  return (
    departmentFallbacks.find((item) => item.departmentCode === normalized || item.departmentName === normalized) ??
    departmentFallbacks[0]
  );
}

export function getStaffDepartmentTheme(department?: Department | null): StaffDepartmentTheme {
  const key = department?.departmentCode ? normalizeDepartmentName(department.departmentCode) : 'ALERT SECURITY';
  return themeByCode[key] ?? themeByCode['ALERT SECURITY'];
}

export function getDepartmentGlyph(code?: string | null) {
  const normalized = normalizeDepartmentName(code ?? '');
  return themeByCode[normalized]?.icon ?? 'D';
}

export function getDepartmentBadgeLabel(code?: string | null) {
  const normalized = normalizeDepartmentName(code ?? '');
  return themeByCode[normalized]?.icon ?? 'D';
}

export function getDepartmentIconName(code?: string | null) {
  const normalized = normalizeDepartmentName(code ?? '');
  switch (normalized) {
    case 'ALERT SECURITY':
      return 'shield-check-outline';
    case 'ALERT FIRE STATION':
      return 'fire';
    case 'ALERT MEDICAL':
      return 'plus-box';
    case 'IT HELPDESK':
      return 'headset';
    default:
      return 'ellipse';
  }
}

export function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return '0 menit';
  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours <= 0) return `${mins} menit`;
  if (mins <= 0) return `${hours} jam`;
  return `${hours} jam ${mins} menit`;
}

export function getResolutionMinutes(report: Report) {
  if (typeof report.resolutionMinutes === 'number' && Number.isFinite(report.resolutionMinutes)) {
    return report.resolutionMinutes;
  }

  if (!report.createdAt || !report.completedAt) return null;

  const createdAt = new Date(report.createdAt).getTime();
  const completedAt = new Date(report.completedAt).getTime();
  if (!Number.isFinite(createdAt) || !Number.isFinite(completedAt) || completedAt <= createdAt) return null;
  return Math.round((completedAt - createdAt) / 60000);
}

export function getAverageResolution(reports: Report[]) {
  const durations = reports
    .map((report) => getResolutionMinutes(report))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (durations.length === 0) return null;

  const average = Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length);
  return formatDuration(average);
}
