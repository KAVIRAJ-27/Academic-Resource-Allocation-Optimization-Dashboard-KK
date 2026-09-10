import React from 'react';
import { ROLES } from '../constants/roles';
import { DashboardShell } from '../components/layout/DashboardShell';

export const PrincipalLayout: React.FC = () => {
  return (
    <DashboardShell
      role={ROLES.PRINCIPAL}
      title="Principal Directorate"
    />
  );
};
