import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole, ROLE_COLORS, ROLE_LABELS } from '../../constants/roles';
import { ROLE_NAVIGATION } from '../../constants/navigation';
import { DynamicIcon } from './DynamicIcon';
import { Shield, Sparkles, Database } from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  className?: string;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, className = '', onItemClick }) => {
  const config = ROLE_NAVIGATION[role];
  const roleColor = ROLE_COLORS[role];

  return (
    <aside
      className={`w-64 bg-[#0B0D14] border-r border-[#1E2330] flex flex-col h-full shrink-0 select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E2330] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-black text-sm shadow-card-glow tracking-wider">
            AH
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white font-mono">
                AHRAO
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-teal-500/20 text-teal-300 rounded border border-teal-500/30">
                P1
              </span>
            </div>
            <p className="text-[10px] text-gray-400 truncate max-w-[130px]">
              Resource Allocation OS
            </p>
          </div>
        </div>
      </div>

      {/* Role Banner */}
      <div className="px-4 py-3 bg-[#11141C] border-b border-[#1E2330]">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${roleColor.badge.includes('teal') ? 'bg-teal-400' : roleColor.badge.includes('purple') ? 'bg-purple-400' : roleColor.badge.includes('blue') ? 'bg-blue-400' : 'bg-orange-400'} animate-pulse`} />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            {config.title}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">{config.subtitle}</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {config.items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#171A23] text-teal-300 border border-teal-500/40 shadow-card font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#11141C] border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300'
                        : 'bg-[#171A23] text-gray-400 group-hover:text-gray-200 group-hover:bg-[#222838]'
                    }`}
                  >
                    <DynamicIcon name={item.iconName} className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="truncate">{item.title}</span>
                </div>
                {item.category && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase shrink-0 ${
                      item.category === 'Academic'
                        ? 'bg-teal-950/40 text-teal-400 border border-teal-800/40'
                        : item.category === 'Hostel'
                        ? 'bg-orange-950/40 text-orange-400 border border-orange-800/40'
                        : 'bg-gray-800/40 text-gray-400 border border-gray-700/40'
                    }`}
                  >
                    {item.category.slice(0, 4)}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer System Telemetry */}
      <div className="p-3 border-t border-[#1E2330] bg-[#0E1018] space-y-2">
        <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            MySQL Ready
          </span>
          <span className="font-mono text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
            v1.0.0
          </span>
        </div>
        <div className="p-2 rounded-lg bg-[#141822] border border-[#1E2330] flex items-center gap-2 text-[10px] text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">SDG 4 Quality Education</span>
        </div>
      </div>
    </aside>
  );
};
