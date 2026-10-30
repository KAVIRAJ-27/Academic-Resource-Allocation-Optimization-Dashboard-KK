import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_LABELS, UserRole } from '../../constants/roles';
import { User, LogOut, ChevronDown, Repeat } from 'lucide-react';

export const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = (targetRole: UserRole) => {
    switchRole(targetRole);
    setIsOpen(false);
    navigate(`/${targetRole.toLowerCase()}/dashboard`);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white/70 backdrop-blur-sm border border-[#D8C9A8]/70 hover:bg-[#F4F0E6] hover:border-[#B8A16A] transition-all focus:outline-none focus:ring-2 focus:ring-[#B8A16A]/20 shadow-xs"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F4F0E6] to-[#E8E0D0] border border-[#D8C9A8] flex items-center justify-center text-[#202020] font-serif font-bold text-xs shadow-xs">
          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-[#202020] leading-tight truncate max-w-[130px]">
            {user.name}
          </span>
          <span className="text-[10px] text-[#77736A] font-mono">
            {user.role}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#77736A] ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-2xl border border-[#D8C9A8]/80 shadow-dropdown z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 bg-[#F8F6F0]/80 border-b border-[#E8E0D0]/80 backdrop-blur-sm">
            <p className="text-xs font-bold font-serif text-[#202020] truncate">{user.name}</p>
            <p className="text-[11px] text-[#555555] truncate mt-0.5">{user.email}</p>
            <div className="mt-2 inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-[#F4F0E6] text-[#202020] border border-[#D8C9A8] font-semibold uppercase tracking-wider">
              {ROLE_LABELS[user.role]}
            </div>
          </div>

          {/* Quick Role Switcher for Demo Testing */}
          <div className="p-3 border-b border-[#E8E0D0]/80">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#77736A] uppercase tracking-wider mb-2 font-mono">
              <Repeat className="w-3 h-3 text-[#B8A16A]" />
              <span>Switch Role (Live Sandbox)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(ROLES) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`py-1.5 px-2 text-[11px] rounded-lg text-left transition-all font-medium ${
                    user.role === r
                      ? 'bg-[#F4F0E6] text-[#202020] border border-[#B8A16A] font-bold shadow-xs'
                      : 'bg-white/80 hover:bg-[#F8F6F0] text-[#555555] border border-[#D9D2C3]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="p-1.5">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(`/${user.role.toLowerCase()}/dashboard`);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#555555] hover:text-[#202020] hover:bg-[#F4F0E6] rounded-lg transition-colors text-left font-medium"
            >
              <User className="w-3.5 h-3.5 text-[#77736A]" />
              Role Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#B44747] hover:text-[#9B3C3C] hover:bg-[#FDF0F0] rounded-lg transition-colors text-left font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
