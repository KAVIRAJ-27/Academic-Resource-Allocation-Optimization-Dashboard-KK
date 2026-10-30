import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../../ui';
import { FacultySummary, FacultyDepartmentSummary } from '../../../types/faculty';
import { User, Mail, Phone, GraduationCap, Building2, ExternalLink } from 'lucide-react';

interface FacultyProfileCardProps {
  profile?: FacultySummary;
  department?: FacultyDepartmentSummary;
}

export const FacultyProfileCard: React.FC<FacultyProfileCardProps> = ({ profile, department }) => {
  const navigate = useNavigate();

  if (!profile) {
    return (
      <Card className="h-full bg-white/80 backdrop-blur-md border border-[#D8C9A8]/70 shadow-glass rounded-2xl">
        <CardContent className="p-6 text-center text-[#77736A]">
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
    <Card className="h-full bg-white/80 backdrop-blur-md border border-[#D8C9A8]/70 shadow-glass rounded-2xl flex flex-col justify-between hover:border-[#B8A16A] transition-all duration-200">
      <div>
        <CardHeader className="border-b border-[#E8E0D0]/80 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FAF7F0] via-[#F4F0E6] to-[#E8E0D0] border border-[#D8C9A8] flex items-center justify-center text-[#B8A16A] font-serif font-bold text-base shadow-xs tracking-wider">
                {initials}
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
                  {profile.fullName}
                </CardTitle>
                <p className="text-xs text-[#B8A16A] font-medium font-serif">
                  {profile.designation || 'Faculty Member'}
                </p>
              </div>
            </div>
            <Badge variant="success" dot>
              {profile.status || 'ACTIVE'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-[#E8E0D0]/60">
            <span className="text-[#77736A] flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#B8A16A]" /> Employee ID
            </span>
            <span className="font-mono font-semibold text-[#202020]">{profile.employeeId}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#E8E0D0]/60">
            <span className="text-[#77736A] flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#B8A16A]" /> Department
            </span>
            <span className="font-medium text-[#202020] text-right truncate max-w-[180px]" title={department?.departmentName || profile.departmentName}>
              {department?.departmentName || profile.departmentName || 'Department information unavailable'}
            </span>
          </div>

          {profile.qualification && (
            <div className="flex items-center justify-between py-1 border-b border-[#E8E0D0]/60">
              <span className="text-[#77736A] flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-[#B8A16A]" /> Qualification
              </span>
              <span className="font-medium text-[#202020] text-right truncate max-w-[180px]" title={profile.qualification}>
                {profile.qualification}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-1 border-b border-[#E8E0D0]/60">
            <span className="text-[#77736A] flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#B8A16A]" /> Email
            </span>
            <span className="font-mono text-[#555555] truncate max-w-[180px]" title={profile.email}>
              {profile.email}
            </span>
          </div>

          {profile.phone && (
            <div className="flex items-center justify-between py-1 border-b border-[#E8E0D0]/60">
              <span className="text-[#77736A] flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B8A16A]" /> Phone
              </span>
              <span className="font-mono text-[#555555]">{profile.phone}</span>
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-4 border-t border-[#E8E0D0]/80 bg-[#F8F6F0]/60 backdrop-blur-xs rounded-b-2xl">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center text-xs font-semibold"
          rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          onClick={() => navigate('/faculty/profile')}
        >
          View Full Profile
        </Button>
      </div>
    </Card>
  );
};
