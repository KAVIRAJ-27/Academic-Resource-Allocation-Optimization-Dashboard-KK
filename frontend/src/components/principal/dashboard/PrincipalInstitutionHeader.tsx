import React from 'react';
import { PrincipalInstitutionDto } from '../../../types/principal';
import { Badge, Button } from '../../ui';
import { Building2, Mail, Phone, MapPin, User, RefreshCw, Layers, GraduationCap, Users, BookOpen } from 'lucide-react';

interface PrincipalInstitutionHeaderProps {
  institution: PrincipalInstitutionDto;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const PrincipalInstitutionHeader: React.FC<PrincipalInstitutionHeaderProps> = ({
  institution,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-glass mb-6 transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Institution info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 bg-[#FBF9F3]/90 border border-[#D8C9A8]/70 text-[#B8A16A] rounded-2xl shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold tracking-tight text-[#202020]">
                  {institution.name}
                </h1>
                {institution.code && (
                  <Badge variant="neutral" size="sm">
                    {institution.code}
                  </Badge>
                )}
                <Badge variant={institution.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm" dot>
                  {institution.status || 'ACTIVE'}
                </Badge>
              </div>
              <p className="text-sm text-[#555555] flex items-center gap-2 mt-0.5">
                <User className="w-3.5 h-3.5 text-[#77736A]" />
                <span>Principal: <strong className="text-[#202020]">{institution.principalName}</strong></span>
                {institution.principalEmail && (
                  <span className="text-xs text-[#77736A]">({institution.principalEmail})</span>
                )}
              </p>
            </div>
          </div>

          {/* Details strip */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#77736A] pt-1">
            {institution.contactEmail && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#B8A16A]" />
                {institution.contactEmail}
              </span>
            )}
            {institution.contactPhone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#B8A16A]" />
                {institution.contactPhone}
              </span>
            )}
            {institution.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B8A16A]" />
                {institution.address}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#B8A16A]' : ''}`} />}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
          </Button>
        </div>
      </div>

      {/* Mini Quick Count Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E8E0D0]/80">
        <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-xs border border-[#D8C9A8]/60 rounded-xl shadow-xs">
          <div className="p-2 bg-[#F4F0E6] text-[#B8A16A] rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[#77736A] font-medium">Departments</div>
            <div className="text-lg font-serif font-bold text-[#202020]">{institution.departmentCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-xs border border-[#D8C9A8]/60 rounded-xl shadow-xs">
          <div className="p-2 bg-[#FAF7F0] text-[#A87928] rounded-lg">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[#77736A] font-medium">Programs</div>
            <div className="text-lg font-serif font-bold text-[#202020]">{institution.programCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-xs border border-[#D8C9A8]/60 rounded-xl shadow-xs">
          <div className="p-2 bg-[#EEF6F1] text-[#3F7655] rounded-lg">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[#77736A] font-medium">Students</div>
            <div className="text-lg font-serif font-bold text-[#202020]">{institution.studentCount.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-xs border border-[#D8C9A8]/60 rounded-xl shadow-xs">
          <div className="p-2 bg-[#EFF4F8] text-[#657C91] rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[#77736A] font-medium">Faculty</div>
            <div className="text-lg font-serif font-bold text-[#202020]">{institution.facultyCount.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
