import React from 'react';
import { UserRole, ROLE_LABELS, ROLE_COLORS } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Sparkles, Database } from 'lucide-react';

interface RoleWelcomeBannerProps {
  role: UserRole;
  title: string;
  description: string;
}

export const RoleWelcomeBanner: React.FC<RoleWelcomeBannerProps> = ({
  role,
  title,
  description,
}) => {
  const { user } = useAuth();
  const color = ROLE_COLORS[role];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#11141C] via-[#141822] to-[#11141C] border border-[#1E2330] p-6 sm:p-8 mb-6 shadow-card">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-full bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${color.badge}`}
            >
              <Shield className="w-3.5 h-3.5" />
              {ROLE_LABELS[role]}
            </span>
            <span className="text-xs text-gray-400 font-mono bg-[#171A23] px-2.5 py-0.5 rounded-full border border-white/5">
              AHRAO — Phase 1
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            {description}
          </p>

          {user && (
            <div className="flex items-center gap-2 pt-2 text-xs text-gray-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span className="text-gray-400">Active Principal:</span>
              <span className="font-semibold text-gray-200">{user.name}</span>
              {user.department && (
                <span className="text-gray-500">• {user.department}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-[#171A23]/80 border border-[#1E2330] flex items-center gap-2 text-xs text-teal-300">
            <Database className="w-4 h-4 text-teal-400" />
            <span>MySQL: academic_hostel_resource_allocation</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#171A23]/80 border border-[#1E2330] flex items-center gap-2 text-xs text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>SDG 4 — Quality Education Foundation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
