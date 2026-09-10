import { UserRole } from '../constants/roles';

export type Permission =
  | 'USER_READ'
  | 'USER_WRITE'
  | 'ACADEMIC_READ'
  | 'ACADEMIC_ALLOCATE'
  | 'HOSTEL_READ'
  | 'HOSTEL_ALLOCATE'
  | 'APPROVAL_MANAGE'
  | 'SYSTEM_ADMIN'
  | string;

export interface User {
  id: string | number;
  username?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  roles?: string[];
  permissions?: string[];
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  avatarUrl?: string;
  department?: string;
  hostelBlock?: string;
  lastLoginAt?: string;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt?: string | null;
  lastLoginAt: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  roles: string[];
  permissions: string[];
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
}
