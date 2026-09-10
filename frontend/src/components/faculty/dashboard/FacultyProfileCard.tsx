import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../../ui';
import { FacultySummary, FacultyDepartmentSummary } from '../../../types/faculty';
import { User, Mail, Phone, GraduationCap, Building2, ExternalLink, ShieldCheck } from 'lucide-react';

interface FacultyProfileCardProps {
  profile?: FacultySummary;
  department?: FacultyDepartmentSummary;
}

export const FacultyProfileCard: React.FC<FacultyProfileCardProps> = ({ profile, department }) => {
  const navigate = useNavigate();

  if (!profile) {
    return (
      <Card className="h-full bg-[#11141C] border-[#1E2330]">
        <CardContent className="p-6 text-center text-gray-400">
          Faculty profile summary unavailable.
        </CardContent>
      </Card>
    );
  }

  const initials = profile.fullName
    ? profile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'FC';

  return (
    <Card className="h-full bg-[#11141C] border-[#1E2330] flex flex-col justify-between shadow-card hover:border-[#2A3245] transition-all">
      <div>
        <CardHeader className="border-b border-[#1E2330] pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-base shadow-card-glow tracking-wider">
                {initials}
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  {profile.fullName}
                </CardTitle>
                <p className="text-xs text-teal-300 font-medium">
                  {profile.designation || 'Faculty Member'}
                </p>
              </div>
            </div>
            <Badge variant="teal" dot>
              {profile.status || 'ACTIVE'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-[#1A1E29]">
            <span className="text-gray-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-500" /> Employee ID
            </span>
            <span className="font-mono font-semibold text-gray-200">{profile.employeeId}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#1A1E29]">
            <span className="text-gray-400 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-gray-500" /> Department
            </span>
            <span className="font-medium text-gray-200 text-right truncate max-w-[180px]" title={department?.departmentName || profile.departmentName}>
              {department?.departmentName || profile.departmentName || 'Department information unavailable'}
            </span>
          </div>

          {profile.qualification && (
            <div className="flex items-center justify-between py-1 border-b border-[#1A1E29]">
              <span className="text-gray-400 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-gray-500" /> Qualification
              </span>
              <span className="font-medium text-gray-200 text-right truncate max-w-[180px]" title={profile.qualification}>
                {profile.qualification}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-1 border-b border-[#1A1E29]">
            <span className="text-gray-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-500" /> Email
            </span>
            <span className="font-mono text-gray-300 truncate max-w-[180px]" title={profile.email}>
              {profile.email}
            </span>
          </div>

          {profile.phone && (
            <div className="flex items-center justify-between py-1 border-b border-[#1A1E29]">
              <span className="text-gray-400 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-500" /> Phone
              </span>
              <span className="font-mono text-gray-300">{profile.phone}</span>
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-4 border-t border-[#1E2330] bg-[#0E1017] rounded-b-2xl">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center text-xs font-semibold text-teal-300 border-teal-500/30 hover:bg-teal-500/10"
          rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          onClick={() => navigate('/faculty/profile')}
        >
          View Full Profile
        </Button>
      </div>
    </Card>
  );
};
