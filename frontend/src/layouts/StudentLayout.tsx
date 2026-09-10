import React from 'react';
import { ROLES } from '../constants/roles';
import { DashboardShell } from '../components/layout/DashboardShell';

export const StudentLayout: React.FC = () => {
  return (
    <DashboardShell
      role={ROLES.STUDENT}
      title="Student Academic & Hostel Portal"
    />
  );
};
