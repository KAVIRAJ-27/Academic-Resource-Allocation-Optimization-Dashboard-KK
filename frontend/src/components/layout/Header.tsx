import React from 'react';
import { Menu, Search, Shield } from 'lucide-react';
import { NotificationArea } from './NotificationArea';
import { ProfileMenu } from './ProfileMenu';
import { UserRole, ROLE_LABELS, ROLE_COLORS } from '../../constants/roles';

interface HeaderProps {
  role: UserRole;
  onOpenMobileNav: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ role, onOpenMobileNav, title }) => {
  const roleColor = ROLE_COLORS[role];

  return (
    <header className="h-16 bg-[#0B0D14]/90 backdrop-blur-md border-b border-[#1E2330] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
      {/* Left side: Hamburger button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          aria-label="Open navigation drawer"
          className="lg:hidden p-2 rounded-xl bg-[#171A23] border border-[#1E2330] text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-block font-extrabold text-sm text-teal-400 font-mono tracking-wider">
            AHRAO
          </span>
          <span className="hidden sm:inline-block text-gray-600 font-mono">/</span>
          <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-none">
            {title || ROLE_LABELS[role]}
          </h2>
        </div>
      </div>

      {/* Middle search bar (hidden on small mobile) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search classrooms, labs, hostels, blocks, beds..."
            className="w-full bg-[#11141C] border border-[#1E2330] rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
            readOnly
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-mono bg-[#171A23] px-1.5 py-0.5 rounded border border-white/5">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right side controls: Role badge + Notification Area + Profile Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11141C] border border-[#1E2330]">
          <Shield className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[11px] font-mono text-gray-300 uppercase tracking-wide">
            {role}
          </span>
        </div>

        <NotificationArea />

        <div className="h-6 w-px bg-[#1E2330] mx-0.5 hidden sm:block" />

        <ProfileMenu />
      </div>
    </header>
  );
};
