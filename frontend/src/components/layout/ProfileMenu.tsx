import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_LABELS, UserRole } from '../../constants/roles';
import { User, LogOut, ChevronDown, Repeat, ExternalLink } from 'lucide-react';

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
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-[#171A23] border border-[#1E2330] hover:border-gray-600 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500"
      >
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-semibold text-xs">
          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-gray-200 leading-tight truncate max-w-[130px]">
            {user.name}
          </span>
          <span className="text-[10px] text-teal-400 font-mono">
            {user.role}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#11141C] border border-[#1E2330] shadow-dropdown z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 bg-[#141822] border-b border-[#1E2330]">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
            <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
              {ROLE_LABELS[user.role]}
            </div>
          </div>

          {/* Quick Role Switcher for Phase 1 Testing */}
          <div className="p-3 border-b border-[#1E2330]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <Repeat className="w-3 h-3 text-teal-400" />
              <span>Switch Role (Phase 1 Sandbox)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(ROLES) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`py-1.5 px-2 text-[11px] rounded-lg text-left transition-colors font-medium ${
                    user.role === r
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-[#171A23] hover:bg-[#222838] text-gray-300 border border-white/5'
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
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#171A23] rounded-lg transition-colors text-left"
            >
              <User className="w-3.5 h-3.5 text-gray-400" />
              Role Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
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
