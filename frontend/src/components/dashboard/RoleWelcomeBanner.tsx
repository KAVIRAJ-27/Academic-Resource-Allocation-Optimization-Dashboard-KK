import React from 'react';
import { UserRole, ROLE_LABELS } from '../../constants/roles';
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

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-[#D8C9A8] p-6 sm:p-7 mb-6 shadow-card">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#F4F0E6] text-[#202020] border border-[#D8C9A8]"
            >
              <Shield className="w-3.5 h-3.5 text-[#B8A16A]" />
              {ROLE_LABELS[role]}
            </span>
            <span className="text-xs text-[#77736A] font-mono bg-[#F8F6F0] px-2.5 py-0.5 rounded-full border border-[#E8E0D0]">
              AHRAO Platform
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#202020] tracking-tight">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-[#555555] font-normal leading-relaxed">
            {description}
          </p>

          {user && (
            <div className="flex items-center gap-2 pt-1 text-xs text-[#555555]">
              <span className="w-2 h-2 rounded-full bg-[#3F7655]" />
              <span className="text-[#77736A] font-medium">Active Account:</span>
              <span className="font-semibold text-[#202020]">{user.name}</span>
              {user.department && (
                <span className="text-[#77736A]">• Department of {user.department}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0] flex items-center gap-2 text-xs text-[#555555]">
            <Database className="w-4 h-4 text-[#3F7655]" />
            <span className="font-mono text-[11px]">MySQL: academic_hostel_resource_allocation</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#F4F0E6] border border-[#D8C9A8] flex items-center gap-2 text-xs text-[#202020]">
            <Sparkles className="w-4 h-4 text-[#B8A16A]" />
            <span className="text-[11px] font-medium font-serif">SDG 4 — Quality Education Optimization</span>
          </div>
        </div>
      </div>
    </div>
  );
};
