import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodDepartmentInfo } from '../../../types/hod';
import {
  Building2,
  UserCheck,
  Mail,
  CreditCard,
  Calendar,
  RefreshCw,
  School,
} from 'lucide-react';

interface HodDepartmentHeaderProps {
  department: HodDepartmentInfo;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const HodDepartmentHeader: React.FC<HodDepartmentHeaderProps> = ({
  department,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <Card className="relative overflow-hidden border border-[#D8C9A8]/70 bg-white/80 backdrop-blur-md p-6 shadow-glass rounded-2xl">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FBF9F3]/90 border border-[#D8C9A8]/70 text-[#B8A16A] shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-serif font-bold text-[#202020] tracking-tight">
                  {department.name}
                </h1>
                <Badge variant="neutral" size="md">
                  {department.code}
                </Badge>
                <Badge
                  variant={department.status === 'ACTIVE' ? 'success' : 'neutral'}
                  dot
                >
                  {department.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#77736A] mt-1">
                <School className="w-4 h-4 text-[#B8A16A]" />
                <span>{department.institutionName || 'Affiliated Campus'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            leftIcon={
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#B8A16A]' : ''}`}
              />
            }
          >
            {isRefreshing ? 'Syncing...' : 'Refresh Live Data'}
          </Button>
        </div>
      </div>

      {/* Active HOD Profile Details Strip */}
      <div className="mt-6 pt-5 border-t border-[#E8E0D0]/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#D8C9A8]/60 shadow-xs">
          <UserCheck className="w-4 h-4 text-[#3F7655] shrink-0" />
          <div>
            <span className="text-[#77736A] block font-medium">Head of Department</span>
            <span className="text-[#202020] font-bold truncate block">
              {department.hodName || 'Assigned Faculty'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#D8C9A8]/60 shadow-xs">
          <Mail className="w-4 h-4 text-[#B8A16A] shrink-0" />
          <div>
            <span className="text-[#77736A] block font-medium">Official Contact</span>
            <span className="text-[#202020] font-medium truncate block">
              {department.hodEmail || 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#D8C9A8]/60 shadow-xs">
          <CreditCard className="w-4 h-4 text-[#657C91] shrink-0" />
          <div>
            <span className="text-[#77736A] block font-medium">Employee Identifier</span>
            <span className="text-[#202020] font-medium font-mono block">
              {department.hodEmployeeId || 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#D8C9A8]/60 shadow-xs">
          <Calendar className="w-4 h-4 text-[#A87928] shrink-0" />
          <div>
            <span className="text-[#77736A] block font-medium">Serving Since</span>
            <span className="text-[#202020] font-medium block">
              {department.hodSince ? new Date(department.hodSince).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Current Academic Term'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
