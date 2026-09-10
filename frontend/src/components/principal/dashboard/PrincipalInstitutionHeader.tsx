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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Institution info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {institution.name}
                </h1>
                {institution.code && (
                  <Badge variant="blue" size="sm">
                    {institution.code}
                  </Badge>
                )}
                <Badge variant={institution.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm" dot>
                  {institution.status || 'ACTIVE'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Principal: <strong className="text-slate-700 dark:text-slate-200">{institution.principalName}</strong></span>
                {institution.principalEmail && (
                  <span className="text-xs text-slate-400">({institution.principalEmail})</span>
                )}
              </p>
            </div>
          </div>

          {/* Details strip */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
            {institution.contactEmail && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {institution.contactEmail}
              </span>
            )}
            {institution.contactPhone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {institution.contactPhone}
              </span>
            )}
            {institution.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {institution.address}
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick action */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
          </Button>
        </div>
      </div>

      {/* Mini Quick Count Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Departments</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{institution.departmentCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Programs</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{institution.programCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Students</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{institution.studentCount.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl">
          <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Faculty</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{institution.facultyCount.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
