import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UserRole, ROLE_LABELS } from '../../constants/roles';
import { COLOR_TOKENS } from '../../theme/tokens';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';

interface DashboardShellProps {
  role: UserRole;
  title?: string;
  children?: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  role,
  title,
  children,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const roleTheme = COLOR_TOKENS.role[role];

  return (
    <div className="flex h-screen bg-[#FFFEFA] text-[#202020] overflow-hidden relative antialiased font-sans">
      {/* Classical Gold Accent Line at Top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none"
        style={{
          backgroundColor: roleTheme?.accent || '#B8A16A',
        }}
        aria-hidden="true"
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar role={role} />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        role={role}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FFFEFA]">
        <Header
          role={role}
          onOpenMobileNav={() => setIsMobileOpen(true)}
          title={title || ROLE_LABELS[role]}
        />

        {/* Main Scrollable Content */}
        <main
          className="flex-1 overflow-y-auto bg-[#FFFEFA] focus:outline-none"
          id="main-content"
          tabIndex={-1}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
