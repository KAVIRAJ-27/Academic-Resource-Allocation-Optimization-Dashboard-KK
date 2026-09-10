import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ROLES, UserRole } from '../constants/roles';
import { User, AuthContextType, LoginCredentials, RegisterData, Permission } from '../types/auth';
import { authApi, CurrentUserApiResponse, LoginApiResponse } from '../services/api/authApi';
import { authStorage } from '../utils/authStorage';

// Seeded test user templates for rapid local sandbox exploration
const SEED_USERS: Record<UserRole, User> = {
  [ROLES.ADMIN]: {
    id: 1,
    username: 'admin',
    name: 'Dr. Alexander Vance',
    firstName: 'Alexander',
    lastName: 'Vance',
    email: 'admin@ahrao.edu',
    role: ROLES.ADMIN,
    roles: ['ADMIN'],
    permissions: ['USER_READ', 'USER_WRITE', 'ACADEMIC_READ', 'ACADEMIC_ALLOCATE', 'HOSTEL_READ', 'HOSTEL_ALLOCATE', 'APPROVAL_MANAGE', 'SYSTEM_ADMIN'],
    department: 'Central Administration',
    status: 'ACTIVE',
  },
  [ROLES.PRINCIPAL]: {
    id: 2,
    username: 'principal',
    name: 'Prof. Margaret Sterling',
    firstName: 'Margaret',
    lastName: 'Sterling',
    email: 'principal@ahrao.edu',
    role: ROLES.PRINCIPAL,
    roles: ['PRINCIPAL'],
    permissions: ['USER_READ', 'ACADEMIC_READ', 'HOSTEL_READ', 'APPROVAL_MANAGE'],
    department: 'Institutional Directorate',
    status: 'ACTIVE',
  },
  [ROLES.HOD]: {
    id: 3,
    username: 'hod_cs',
    name: 'Dr. Rajesh Sharma',
    firstName: 'Rajesh',
    lastName: 'Sharma',
    email: 'hod.cs@ahrao.edu',
    role: ROLES.HOD,
    roles: ['HOD'],
    permissions: ['USER_READ', 'ACADEMIC_READ', 'ACADEMIC_ALLOCATE', 'APPROVAL_MANAGE'],
    department: 'Computer Science & Engineering',
    status: 'ACTIVE',
  },
  [ROLES.FACULTY]: {
    id: 4,
    username: 'faculty_john',
    name: 'Prof. Elena Rostova',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'faculty@ahrao.edu',
    role: ROLES.FACULTY,
    roles: ['FACULTY'],
    permissions: ['ACADEMIC_READ'],
    department: 'Computer Science & Engineering',
    status: 'ACTIVE',
  },
  [ROLES.STUDENT]: {
    id: 5,
    username: 'student_alex',
    name: 'Aiden Brooks',
    firstName: 'Aiden',
    lastName: 'Brooks',
    email: 'student@ahrao.edu',
    role: ROLES.STUDENT,
    roles: ['STUDENT'],
    permissions: ['ACADEMIC_READ', 'HOSTEL_READ'],
    department: 'Information Technology',
    hostelBlock: 'Block-B (Floor 3, Room 304)',
    status: 'ACTIVE',
  },
  [ROLES.WARDEN]: {
    id: 6,
    username: 'warden_smith',
    name: 'Chief Warden Marcus Cole',
    firstName: 'Marcus',
    lastName: 'Cole',
    email: 'warden@ahrao.edu',
    role: ROLES.WARDEN,
    roles: ['WARDEN'],
    permissions: ['HOSTEL_READ', 'HOSTEL_ALLOCATE', 'APPROVAL_MANAGE'],
    hostelBlock: 'North Campus Hostels (Block A & B)',
    status: 'ACTIVE',
  },
};

function mapBackendUserToClient(backendUser: CurrentUserApiResponse | LoginApiResponse): User {
  const primaryRole = (backendUser.roles && backendUser.roles.length > 0
    ? (backendUser.roles[0].toUpperCase() as UserRole)
    : ROLES.STUDENT);

  const fullName = `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || backendUser.username;

  return {
    id: 'userId' in backendUser ? backendUser.userId : backendUser.id,
    username: backendUser.username,
    name: fullName,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    email: backendUser.email,
    role: primaryRole,
    roles: backendUser.roles,
    permissions: backendUser.permissions,
    status: backendUser.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING',
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = authStorage.getUser<User>();
    if (saved) return saved;
    return SEED_USERS[ROLES.ADMIN];
  });

  const [token, setToken] = useState<string | null>(() => {
    return authStorage.getToken() || 'mock-jwt-token';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync token and user into centralized authStorage
  useEffect(() => {
    if (user) {
      authStorage.setUser(user);
    } else {
      authStorage.removeUser();
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      authStorage.setToken(token);
    } else {
      authStorage.removeToken();
    }
  }, [token]);

  // Attempt session validation on mount if non-mock token exists
  useEffect(() => {
    const existingToken = authStorage.getToken();
    if (existingToken && !existingToken.startsWith('mock-')) {
      authApi.getCurrentUser()
        .then((res) => {
          if (res.data) {
            setUser(mapBackendUserToClient(res.data));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      const apiData = response.data;
      const clientUser = mapBackendUserToClient(apiData);

      setToken(apiData.accessToken);
      setUser(clientUser);
      authStorage.setToken(apiData.accessToken);
      authStorage.setUser(clientUser);
      return clientUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.register(data);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const res = await authApi.getCurrentUser();
    if (res.data) {
      const clientUser = mapBackendUserToClient(res.data);
      setUser(clientUser);
      authStorage.setUser(clientUser);
    }
  };

  const loginAs = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      const selected = SEED_USERS[role];
      setUser(selected);
      const mockToken = `mock-token-${role.toLowerCase()}-${Date.now()}`;
      setToken(mockToken);
      authStorage.setToken(mockToken);
      authStorage.setUser(selected);
      setIsLoading(false);
    }, 120);
  };

  const switchRole = (role: UserRole) => {
    loginAs(role);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      authStorage.clearAuth();
    }
  };

  const roles = useMemo(() => {
    if (!user) return [];
    if (user.roles && user.roles.length > 0) return user.roles;
    return [user.role];
  }, [user]);

  const permissions = useMemo(() => {
    if (!user || !user.permissions) return [];
    return user.permissions;
  }, [user]);

  const hasRole = (checkRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN || roles.includes(ROLES.ADMIN)) return true;
    if (Array.isArray(checkRole)) {
      return checkRole.some((r) => r === user.role || roles.includes(r));
    }
    return user.role === checkRole || roles.includes(checkRole);
  };

  const hasPermission = (checkPerm: Permission | Permission[]): boolean => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN || roles.includes(ROLES.ADMIN)) return true;
    if (Array.isArray(checkPerm)) {
      return checkPerm.some((p) => permissions.includes(p));
    }
    return permissions.includes(checkPerm);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        token,
        isLoading,
        roles,
        permissions,
        login,
        register,
        loginAs,
        logout,
        switchRole,
        refreshUser,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
