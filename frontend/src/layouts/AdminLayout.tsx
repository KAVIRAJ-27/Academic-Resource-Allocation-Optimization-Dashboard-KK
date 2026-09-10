import React from 'react';
import { ROLES } from '../constants/roles';
import { DashboardShell } from '../components/layout/DashboardShell';

export const AdminLayout: React.FC = () => {
  return (
    <DashboardShell
      role={ROLES.ADMIN}
      title="System Administration"
    />
  );
};
