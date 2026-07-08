export type UserRole = 'admin' | 'staff' | 'user';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ReportStatus = 'open' | 'progress' | 'close';

export type Department = {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isActive: boolean;
};

export type User = {
  userId: number;
  roleId: number;
  departmentId?: number | null;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  photoUrl?: string | null;
  approvalStatus: ApprovalStatus;
  approvedByUserId?: number | null;
  approvedAt?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  role?: UserRole;
  department?: string | null;
};

export type ReportAttachment = {
  attachmentId: number;
  reportId: number;
  attachmentType: 'incident_photo' | 'completion_photo';
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type Report = {
  reportId: number;
  departmentId: number;
  sourceDepartmentId?: number | null;
  clientSubmissionId?: string | null;
  reporterUserId: number | null;
  assignedStaffId?: number | null;
  description: string;
  incidentLocationText: string;
  incidentLatitude?: number | null;
  incidentLongitude?: number | null;
  status: ReportStatus;
  progressStartedAt?: string | null;
  arrivedAt?: string | null;
  arrivedLocationText?: string | null;
  completedAt?: string | null;
  completedLocationText?: string | null;
  resolutionMinutes?: number | null;
  completionDescription?: string | null;
  ratingScore?: number | null;
  ratingComment?: string | null;
  ratedAt?: string | null;
  requesterRatingScore?: number | null;
  requesterRatingComment?: string | null;
  requesterRatedAt?: string | null;
  staffRatingScore?: number | null;
  staffRatingComment?: string | null;
  staffRatedAt?: string | null;
  requesterReviewPending?: boolean;
  staffReviewPending?: boolean;
  createdAt?: string;
  updatedAt?: string;
  department?: string;
  sourceDepartment?: string;
  reporter?: {
    userId: number;
    fullName: string;
    email: string;
  };
  assignedStaff?: {
    userId: number;
    fullName: string;
    email: string;
  };
  attachments?: ReportAttachment[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type ApiListResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
