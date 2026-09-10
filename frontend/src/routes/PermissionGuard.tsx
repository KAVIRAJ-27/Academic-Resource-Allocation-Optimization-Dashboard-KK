import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants/roles';
import { Permission } from '../types/auth';

interface PermissionGuardProps {
  permission?: Permission | Permission[];
  requiredRole?: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requiredRole,
  children,
  fallback = null,
}) => {
  const { user, hasRole, hasPermission } = useAuth();

  if (!user) return <>{fallback}</>;

  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
