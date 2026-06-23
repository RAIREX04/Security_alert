import type { Department } from '../types/models';

export const departmentFallbacks: Department[] = [
  {
    departmentId: 1,
    departmentCode: 'ALERT SECURITY',
    departmentName: 'ALERT SECURITY',
    description: 'Penanganan keamanan dan gangguan kantor dan perumahan',
    icon: 'shield',
    color: '#1D4ED8',
    isActive: true,
  },
  {
    departmentId: 2,
    departmentCode: 'ALERT FIRE STATION',
    departmentName: 'ALERT FIRE STATION',
    description: 'Penanganan kebakaran, ledakan, dan gas berbahaya',
    icon: 'fire',
    color: '#DC2626',
    isActive: true,
  },
  {
    departmentId: 3,
    departmentCode: 'ALERT MEDICAL',
    departmentName: 'ALERT MEDICAL',
    description: 'Penanganan kondisi kesehatan darurat',
    icon: 'medical',
    color: '#059669',
    isActive: true,
  },
  {
    departmentId: 4,
    departmentCode: 'IT HELPDESK',
    departmentName: 'IT HELPDESK',
    description: 'Penanganan gangguan IT dan support aplikasi',
    icon: 'computer',
    color: '#EA580C',
    isActive: true,
  },
];

export function normalizeDepartmentName(value: string) {
  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case 'security':
    case 'alert security':
      return 'ALERT SECURITY';
    case 'fire alert':
    case 'alert fire station':
      return 'ALERT FIRE STATION';
    case 'medical':
    case 'alert medical':
      return 'ALERT MEDICAL';
    case 'it helper':
    case 'it helpdesk':
      return 'IT HELPDESK';
    default:
      return value.trim();
  }
}

