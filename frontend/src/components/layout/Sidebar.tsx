import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserRole } from '../../constants/roles';
import { ROLE_NAVIGATION } from '../../constants/navigation';
import { DynamicIcon } from './DynamicIcon';
import { useAuth } from '../../hooks/useAuth';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Sparkles 
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  className?: string;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, className = '', onItemClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const config = ROLE_NAVIGATION[role];

  // Group items by category if available, maintaining original sequence
  const groupedItems = React.useMemo(() => {
    const groups: { category: string; items: typeof config.items }[] = [];
    const categoryMap = new Map<string, typeof config.items>();

    config.items.forEach((item) => {
      const cat = item.category || 'General';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push(item);
    });

    categoryMap.forEach((items, category) => {
      groups.push({ category, items });
    });

    return groups;
  }, [config.items]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`bg-[#FFFEFA]/86 backdrop-blur-2xl border-r border-[#D8C9A8]/60 flex flex-col h-full shrink-0 select-none transition-all duration-300 relative shadow-[4px_0_24px_rgba(90,75,45,0.04)] ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } ${className}`}
    >
      {/* Brand Header */}
      <div className={`p-4 border-b border-[#D8C9A8]/50 flex items-center bg-[#FFFEFA]/70 backdrop-blur-md ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C2AB75] via-[#B8A16A] to-[#8C7748] flex items-center justify-center text-[#202020] font-serif font-bold text-sm shadow-sm shrink-0 border border-[#D8C9A8]/80">
            AH
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base tracking-tight text-[#202020]">
                  AHRAO
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-[#F4F0E6]/90 text-[#202020] rounded border border-[#D8C9A8]">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-[#77736A] font-medium truncate max-w-[145px]">
                Academic & Hostel Resource OS
              </p>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button (Desktop Only) */}
        {!className.includes('w-full') && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`p-1.5 rounded-lg text-[#77736A] hover:text-[#202020] hover:bg-[#F4F0E6] transition-colors ${
              isCollapsed ? 'hidden' : 'hidden lg:block'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role Pill Strip */}
      <div className={`px-3 py-2.5 bg-[#F8F6F0]/70 border-b border-[#D8C9A8]/50 ${isCollapsed ? 'text-center' : ''}`}>
        {isCollapsed ? (
          <div className="flex justify-center" title={`${config.title} - ${config.subtitle}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8A16A] ring-2 ring-[#D8C9A8]" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#B8A16A] shrink-0" />
              <span className="text-xs font-serif font-bold text-[#202020] tracking-wide uppercase truncate">
                {config.title}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-white/80 text-[#202020] border border-[#D8C9A8] shadow-xs shrink-0">
              {role}
            </span>
          </div>
        )}
      </div>

      {/* Grouped Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 custom-scrollbar">
        {groupedItems.map((group) => (
          <div key={group.category} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-bold text-[#77736A] uppercase tracking-wider font-mono">
                {group.category}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onItemClick}
                title={isCollapsed ? item.title : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                    isCollapsed
                      ? 'justify-center p-2.5'
                      : 'justify-between px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[#F4F0E6]/90 text-[#202020] border-l-[3px] border-[#B8A16A] font-semibold shadow-xs'
                      : 'text-[#555555] hover:text-[#202020] hover:bg-white/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                      <div
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isActive
                            ? 'bg-[#B8A16A] text-[#202020] shadow-xs'
                            : 'bg-white/60 text-[#77736A] group-hover:text-[#202020] group-hover:bg-[#F4F0E6]'
                        }`}
                      >
                        <DynamicIcon name={item.iconName} className="w-4 h-4 shrink-0" />
                      </div>
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </div>

                    {!isCollapsed && item.category && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase shrink-0 ${
                          item.category === 'Academic'
                            ? 'bg-[#EEF6F1] text-[#3F7655] border border-[#C1DFCD]'
                            : item.category === 'Hostel'
                            ? 'bg-[#FAF4E8] text-[#A87928] border border-[#EED9B2]'
                            : 'bg-[#F8F6F0] text-[#555555] border border-[#E8E0D0]'
                        }`}
                      >
                        {item.category.slice(0, 4)}
                      </span>
                    )}

                    {/* Active Pip when collapsed */}
                    {isCollapsed && isActive && (
                      <span className="absolute right-1 w-1.5 h-1.5 rounded-full bg-[#B8A16A]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle for Collapsed State */}
      {isCollapsed && (
        <div className="p-2 border-t border-[#D8C9A8]/50 flex justify-center bg-white/60">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand sidebar"
            className="p-2 rounded-lg text-[#77736A] hover:text-[#202020] hover:bg-[#F4F0E6] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Profile & Logout at Bottom */}
      <div className="p-3 border-t border-[#D8C9A8]/50 bg-[#FBF9F3]/80 backdrop-blur-sm">
        {user ? (
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            <div className="flex items-center gap-2.5 min-w-0" title={`${user.name} (${user.role})`}>
              <div className="w-8 h-8 rounded-lg bg-white/80 border border-[#D8C9A8] flex items-center justify-center text-[#202020] font-serif font-bold text-xs shrink-0 shadow-xs">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#202020] truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-[#77736A] font-medium truncate capitalize">
                    {user.role?.toLowerCase()}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-[#77736A] hover:text-[#B44747] hover:bg-[#FDF0F0] rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-1">
            <span className="text-[10px] font-mono text-[#77736A]">AHRAO OS</span>
          </div>
        )}
      </div>
    </aside>
  );
};
