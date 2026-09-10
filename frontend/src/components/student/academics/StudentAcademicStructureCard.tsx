import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../../ui';
import { StudentAcademicOverview } from '../../../types/studentAcademic';
import {
  Building,
  Building2,
  BookOpen,
  CalendarRange,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface StudentAcademicStructureCardProps {
  overview: StudentAcademicOverview;
  subjectCount: number;
}

export const StudentAcademicStructureCard: React.FC<StudentAcademicStructureCardProps> = ({
  overview,
  subjectCount,
}) => {
  const steps = [
    {
      level: '1. Institution',
      title: overview.institutionName || 'University Campus',
      code: overview.institutionCode || 'INST',
      icon: Building,
      badge: 'Academic Base',
      variant: 'neutral' as const,
    },
    {
      level: '2. Department',
      title: overview.departmentName || 'Academic Department',
      code: overview.departmentCode || 'DEPT',
      icon: Building2,
      badge: 'Faculty Body',
      variant: 'teal' as const,
    },
    {
      level: '3. Program / Degree',
      title: overview.programName || 'Degree Program',
      code: overview.programCode || 'PROG',
      icon: BookOpen,
      badge: overview.degreeLevel ? overview.degreeLevel.replace('_', ' ') : 'Undergraduate',
      variant: 'blue' as const,
    },
    {
      level: '4. Academic Year & Semester',
      title: overview.academicYearName || 'Current Session',
      code: `Sem ${overview.currentSemester || '--'}`,
      icon: CalendarRange,
      badge: 'Active Term',
      variant: 'purple' as const,
    },
    {
      level: '5. Section & Cohort',
      title: overview.sectionName ? `Section ${overview.sectionName}` : 'Unallocated',
      code: `${subjectCount} Courses`,
      icon: Layers,
      badge: 'Student Group',
      variant: 'orange' as const,
    },
  ];

  return (
    <Card className="bg-[#11141C] border-[#1E2330]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-100">
                Institutional Academic Hierarchy
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Verified enrollment lineage from university governance to designated classroom section
              </CardDescription>
            </div>
          </div>
          <Badge variant="teal" dot size="sm">
            DB Synced
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="relative">
          {/* Timeline Connector Bar (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-6 right-6 h-0.5 bg-[#1E2330] -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#171A23] border border-[#222838] flex flex-col justify-between hover:border-teal-500/40 transition-all duration-200 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#222838] group-hover:bg-teal-500/20 text-teal-400 flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">
                        {step.level.split('.')[0]}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase text-gray-400 tracking-wider block">
                      {step.level.split('. ')[1]}
                    </span>
                    <h4
                      className="text-xs font-bold text-gray-200 mt-1 truncate group-hover:text-teal-300 transition-colors"
                      title={step.title}
                    >
                      {step.title}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#222838] flex items-center justify-between">
                    <span className="font-mono text-[10px] text-teal-400 font-semibold truncate max-w-[80px]">
                      {step.code}
                    </span>
                    <Badge variant={step.variant} size="sm">
                      {step.badge}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
