import React from 'react';
import { Menu, Search, Shield } from 'lucide-react';
import { NotificationArea } from './NotificationArea';
import { ProfileMenu } from './ProfileMenu';
import { UserRole, ROLE_LABELS } from '../../constants/roles';

interface HeaderProps {
  role: UserRole;
  onOpenMobileNav: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ role, onOpenMobileNav, title }) => {
  return (
    <header className="h-16 bg-[#FFFEFA]/95 backdrop-blur-md border-b border-[#E8E0D0] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left side: Hamburger button + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileNav}
          aria-label="Open navigation drawer"
          className="lg:hidden p-2 rounded-xl bg-[#F8F6F0] border border-[#D9D2C3] text-[#202020] hover:bg-[#F4F0E6] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline-block font-serif font-bold text-sm text-[#B8A16A] tracking-wider">
            AHRAO
          </span>
          <span className="hidden sm:inline-block text-[#D8C9A8] font-mono">/</span>
          <h2 className="text-sm sm:text-base font-serif font-bold text-[#202020] truncate">
            {title || ROLE_LABELS[role]}
          </h2>
        </div>
      </div>

      {/* Middle search bar (hidden on small mobile) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#77736A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search classrooms, labs, hostels, blocks, beds..."
            className="w-full bg-[#FFFFFF] border border-[#D9D2C3] rounded-xl pl-9 pr-12 py-1.5 text-xs text-[#202020] placeholder-[#77736A] focus:outline-none focus:border-[#B8A16A] focus:ring-1 focus:ring-[#B8A16A] transition-all shadow-xs"
            readOnly
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#77736A] font-mono bg-[#F8F6F0] px-1.5 py-0.5 rounded border border-[#E8E0D0]">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right side controls: Role badge + Notification Area + Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F0E6] border border-[#D8C9A8]">
          <Shield className="w-3.5 h-3.5 text-[#B8A16A]" />
          <span className="text-[11px] font-mono font-semibold text-[#202020] uppercase tracking-wide">
            {role}
          </span>
        </div>

        <NotificationArea />

        <div className="h-6 w-px bg-[#E8E0D0] mx-0.5 hidden sm:block" />

        <ProfileMenu />
      </div>
    </header>
  );
};
