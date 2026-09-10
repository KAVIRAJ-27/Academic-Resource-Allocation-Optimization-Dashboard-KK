import React from 'react';
import { ROLES } from '../constants/roles';
import { DashboardShell } from '../components/layout/DashboardShell';

export const HODLayout: React.FC = () => {
  return (
    <DashboardShell
      role={ROLES.HOD}
      title="Head of Department Workspace"
    />
  );
};
