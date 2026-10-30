import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState, Button } from '../../ui';
import { FacultyAssignedSubject } from '../../../types/faculty';
import { BookOpen, Layers, Users, Clock, ArrowRight } from 'lucide-react';

interface FacultySubjectsCardProps {
  subjects?: FacultyAssignedSubject[];
}

export const FacultySubjectsCard: React.FC<FacultySubjectsCardProps> = ({ subjects = [] }) => {
  const navigate = useNavigate();

  if (!subjects || subjects.length === 0) {
    return (
      <Card className="h-full bg-white border-slate-200 shadow-xs flex flex-col">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Assigned Courses & Subjects
            </CardTitle>
            <Badge variant="neutral">0 Courses</Badge>
          </div>
          <CardDescription>
            Official departmental course assignments for this term
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="No subject assignments found."
            description="Assigned courses and syllabus rosters will appear here once allocated by your department HOD."
            icon={BookOpen}
            compact
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white border-slate-200 shadow-xs flex flex-col hover:border-slate-300 transition-all">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Assigned Courses & Subjects
            </CardTitle>
            <CardDescription>
              {subjects.length} active syllabus {subjects.length === 1 ? 'module' : 'modules'} mapped
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">{subjects.length} Subjects</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/faculty/subjects')}
              className="text-purple-600 hover:text-purple-700 text-xs px-2 py-1 h-auto"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2.5 overflow-y-auto max-h-[360px]">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-purple-300 hover:bg-purple-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-purple-700 px-2 py-0.5 bg-purple-50 rounded border border-purple-200">
                  {s.subjectCode}
                </span>
                <span className="font-semibold text-xs text-slate-900 truncate max-w-[240px]" title={s.subjectName}>
                  {s.subjectName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                {s.programName && (
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" /> {s.programName}
                  </span>
                )}
                {s.sectionName && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" /> Sec {s.sectionName}
                  </span>
                )}
                {(s.semesterName || s.academicYearName) && (
                  <span>
                    &bull; {s.semesterName || s.academicYearName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {s.hoursPerWeek && (
                <span className="flex items-center gap-1 text-xs font-mono font-medium text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  <Clock className="w-3 h-3 text-teal-600" />
                  {s.hoursPerWeek} hrs/wk
                </span>
              )}
              <Badge variant={s.status === 'ACTIVE' ? 'teal' : 'neutral'} size="sm">
                {s.status || 'ACTIVE'}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
