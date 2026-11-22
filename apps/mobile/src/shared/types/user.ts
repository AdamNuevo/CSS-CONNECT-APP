export type UserRole = 'student' | 'faculty' | 'org_officer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  studentNumber?: string | null;
  employeeNumber?: string | null;
  program?: string | null;
  yearLevel?: string | null;
  section?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export type PublicUser = UserProfile;

export interface PublicFacultyProfile {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string | null;
  avatarUrl?: string | null;
}
