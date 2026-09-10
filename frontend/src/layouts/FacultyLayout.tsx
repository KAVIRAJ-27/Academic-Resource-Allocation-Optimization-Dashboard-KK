import React from 'react';
import { ROLES } from '../constants/roles';
import { DashboardShell } from '../components/layout/DashboardShell';

export const FacultyLayout: React.FC = () => {
  return (
    <DashboardShell
      role={ROLES.FACULTY}
      title="Faculty Academic Portal"
    />
  );
};
