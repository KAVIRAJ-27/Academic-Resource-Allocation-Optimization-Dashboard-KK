import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../../ui';
import { StudentProfile } from '../../../types/student';
import { GraduationCap, Building2, BookOpen, Calendar, Layers, ShieldCheck } from 'lucide-react';

interface StudentAcademicInfoCardProps {
  profile: StudentProfile;
}

export const StudentAcademicInfoCard: React.FC<StudentAcademicInfoCardProps> = ({ profile }) => {
  return (
    <Card className="bg-[#11141C] border-[#1E2330]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-100">
                Academic Program & Curriculum
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Official university registration records verified by academic registry
              </CardDescription>
            </div>
          </div>
          <Badge variant="teal" dot size="sm">
            Registry Verified
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Department */}
          <div className="p-3.5 rounded-xl bg-[#171A23] border border-[#222838]">
            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              Department
            </div>
            <p className="text-xs font-bold text-gray-100 truncate" title={profile.departmentName}>
              {profile.departmentName || 'Not Assigned'}
            </p>
            {profile.departmentCode && (
              <span className="text-[10px] font-mono text-teal-400 mt-0.5 block">
                {profile.departmentCode}
              </span>
            )}
          </div>

          {/* Program / Degree */}
          <div className="p-3.5 rounded-xl bg-[#171A23] border border-[#222838]">
            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Degree Program
            </div>
            <p className="text-xs font-bold text-gray-100 truncate" title={profile.programName}>
              {profile.programName || 'Not Assigned'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {profile.programCode && (
                <span className="text-[10px] font-mono text-blue-400">{profile.programCode}</span>
              )}
              {profile.degreeLevel && (
                <span className="text-[9px] text-gray-400">({profile.degreeLevel.replace('_', ' ')})</span>
              )}
            </div>
          </div>

          {/* Current Semester & Section */}
          <div className="p-3.5 rounded-xl bg-[#171A23] border border-[#222838]">
            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Term & Cohort
            </div>
            <p className="text-xs font-bold text-gray-100">
              Semester {profile.currentSemester} • {profile.sectionName ? `Sec ${profile.sectionName}` : 'Unallocated'}
            </p>
            <span className="text-[10px] font-mono text-purple-400 mt-0.5 block">
              {profile.academicYearName || 'Current Academic Year'}
            </span>
          </div>
        </div>

        {/* Locked Note */}
        <div className="p-3 rounded-xl bg-[#141822] border border-[#1E2330] flex items-center gap-2.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            Academic hierarchy, department affiliation, and enrolled sections are centrally managed by the Registrar and Head of Department.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
