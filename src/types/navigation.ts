import { Department, Report, User } from './models';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  StaffRegister: undefined;
};

export type UserStackParamList = {
  UserHome: undefined;
  UserHistory: undefined;
  UserStatus: undefined;
  UserProfile: undefined;
  ReportForm: { departmentId?: number; departmentName?: string } | undefined;
  ReportDetail: { report: Report };
  EditProfile: { user: User };
  DepartmentSelect: undefined;
  DepartmentDetail: { department: Department };
  CreateStaff: undefined;
  CreateUser: undefined;
  EditUser: { user: User };
  UserDetail: { user: User };
  CompletionProof: { report: Report };
};

export type StaffStackParamList = {
  StaffDashboard: undefined;
  StaffSupport: undefined;
  StaffHistory: undefined;
  StaffProfile: undefined;
  ReportDetail: { report: Report };
  CompletionProof: { report: Report };
  EditProfile: { user: User };
  ReportForm: { departmentId?: number; departmentName?: string } | undefined;
  DepartmentDetail: { department: Department };
  CreateStaff: undefined;
  EditUser: { user: User };
  UserDetail: { user: User };
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  EmployeeDirectory: undefined;
  UserDirectory: undefined;
  AdminHistory: undefined;
  AdminProfile: undefined;
  DepartmentDetail: { department: Department };
  CreateStaff: undefined;
  CreateUser: undefined;
  EditUser: { user: User };
  UserDetail: { user: User };
  EditProfile: { user: User };
  ReportForm: { departmentId?: number; departmentName?: string } | undefined;
  ReportDetail: { report: Report };
  CompletionProof: { report: Report };
};
