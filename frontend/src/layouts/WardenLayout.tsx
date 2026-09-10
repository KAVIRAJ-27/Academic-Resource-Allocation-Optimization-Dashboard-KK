import React from 'react';
import { ROLES } from '../constants/roles';
import { DashboardShell } from '../components/layout/DashboardShell';

export const WardenLayout: React.FC = () => {
  return (
    <DashboardShell
      role={ROLES.WARDEN}
      title="Hostel Warden Administration"
    />
  );
};
