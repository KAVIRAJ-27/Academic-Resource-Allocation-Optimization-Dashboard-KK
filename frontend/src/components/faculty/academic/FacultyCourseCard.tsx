import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../ui';
import { FacultyCourse } from '../../../types/faculty';
import { GraduationCap, BookOpen, Clock, Building2 } from 'lucide-react';

interface FacultyCourseCardProps {
  course: FacultyCourse;
}

export const FacultyCourseCard: React.FC<FacultyCourseCardProps> = ({ course }) => {
  return (
    <Card className="bg-white border-slate-200 hover:border-[#2A3245] transition-all flex flex-col justify-between shadow-card">
      <CardHeader className="pb-3 border-b border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="teal" size="sm">
                {course.programCode}
              </Badge>
              <Badge variant="neutral" size="sm">
                {course.degreeType.replace('_', ' ')}
              </Badge>
            </div>
            <CardTitle className="text-base font-bold text-slate-900 pt-1">
              {course.programName}
            </CardTitle>
          </div>
          <Badge
            variant={course.status === 'ACTIVE' ? 'teal' : 'neutral'}
            size="sm"
          >
            {course.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {course.departmentName && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Building2 className="w-3.5 h-3.5 text-gray-500" />
              <span className="truncate">{course.departmentName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>{course.durationYears} Years Duration</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Teaching Allocation:</span>
          </div>
          <span className="text-xs font-bold text-white bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            {course.assignedSubjectsCount} {course.assignedSubjectsCount === 1 ? 'Subject' : 'Subjects'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
