import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants/roles';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
  fallbackUrl?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallbackUrl = '/unauthorized',
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin has global oversight capability in sandbox, or role must be explicitly allowed
  const hasAccess = allowedRoles.includes(user.role) || user.role === 'ADMIN';

  if (!hasAccess) {
    return <Navigate to={fallbackUrl} replace />;
  }

  return children;
};
