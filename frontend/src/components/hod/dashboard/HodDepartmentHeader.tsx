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
  ShieldCheck,
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
    <Card className="relative overflow-hidden border border-gray-800 bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-purple-950/20 backdrop-blur-xl p-6 shadow-2xl rounded-2xl">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {department.name}
                </h1>
                <Badge variant="purple" size="md">
                  {department.code}
                </Badge>
                <Badge
                  variant={department.status === 'ACTIVE' ? 'teal' : 'neutral'}
                  dot
                >
                  {department.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <School className="w-4 h-4 text-gray-400" />
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
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`}
              />
            }
            className="border-gray-700 hover:border-purple-500/40 text-gray-200"
          >
            {isRefreshing ? 'Syncing...' : 'Refresh Live Data'}
          </Button>
        </div>
      </div>

      {/* Active HOD Profile Details Strip */}
      <div className="mt-6 pt-5 border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-2.5 bg-gray-800/30 p-2.5 rounded-xl border border-gray-800/50">
          <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <div>
            <span className="text-gray-400 block font-medium">Head of Department</span>
            <span className="text-white font-semibold truncate block">
              {department.hodName || 'Assigned Faculty'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-gray-800/30 p-2.5 rounded-xl border border-gray-800/50">
          <Mail className="w-4 h-4 text-purple-400 shrink-0" />
          <div>
            <span className="text-gray-400 block font-medium">Official Contact</span>
            <span className="text-gray-200 font-medium truncate block">
              {department.hodEmail || 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-gray-800/30 p-2.5 rounded-xl border border-gray-800/50">
          <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <span className="text-gray-400 block font-medium">Employee Identifier</span>
            <span className="text-gray-200 font-medium font-mono block">
              {department.hodEmployeeId || 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-gray-800/30 p-2.5 rounded-xl border border-gray-800/50">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-gray-400 block font-medium">Serving Since</span>
            <span className="text-gray-200 font-medium block">
              {department.hodSince ? new Date(department.hodSince).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Current Academic Term'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
