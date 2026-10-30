import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../../ui';
import { StudentTimetableEntry } from '../../../types/studentAcademic';
import { StudentAcademicEmptyState } from './StudentAcademicEmptyState';
import {
  Clock,
  MapPin,
  User,
  BookOpen,
  Calendar,
  Building,
} from 'lucide-react';

interface StudentTimetableProps {
  timetable: StudentTimetableEntry[];
  sectionName?: string;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const StudentTimetable: React.FC<StudentTimetableProps> = ({
  timetable,
  sectionName,
}) => {
  // Group timetable entries by day of week
  const groupedByDay = useMemo(() => {
    const map = new Map<string, StudentTimetableEntry[]>();
    DAYS.forEach((day) => map.set(day, []));

    timetable.forEach((entry) => {
      const dayKey = entry.dayOfWeek?.toUpperCase();
      if (dayKey && map.has(dayKey)) {
        map.get(dayKey)!.push(entry);
      } else {
        // Fallback for non-standard day name
        if (!map.has(dayKey || 'OTHER')) {
          map.set(dayKey || 'OTHER', []);
        }
        map.get(dayKey || 'OTHER')!.push(entry);
      }
    });

    return map;
  }, [timetable]);

  if (timetable.length === 0) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-100">
                Weekly Class Timetable
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                {sectionName ? `Class schedule for Section ${sectionName}` : 'Designated lecture hall and lab slots'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <StudentAcademicEmptyState type="timetable" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-100 flex items-center gap-2">
                Weekly Class Timetable
                <Badge variant="teal" size="sm">
                  {timetable.length} Scheduled Periods
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                {sectionName
                  ? `Active lecture hall and lab directions for Section ${sectionName}`
                  : 'Scheduled classroom periods and laboratory practicals'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="blue" dot size="sm">
            Live Schedule
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {DAYS.map((day) => {
          const entries = groupedByDay.get(day) || [];
          if (entries.length === 0) return null;

          return (
            <div
              key={day}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-xs text-gray-100 tracking-wider font-mono">
                    {day}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {entries.length} {entries.length === 1 ? 'Period' : 'Periods'}
                </span>
              </div>

              {/* Periods Grid / List for the day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {entries.map((period) => (
                  <div
                    key={period.id}
                    className="p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-500/30 transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      {/* Time & Slot Badge */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-mono font-semibold text-teal-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {period.startTime ? period.startTime.slice(0, 5) : '--'} –{' '}
                          {period.endTime ? period.endTime.slice(0, 5) : '--'}
                        </span>
                        {period.timeSlotName && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 font-mono text-gray-400">
                            {period.timeSlotName}
                          </span>
                        )}
                      </div>

                      {/* Subject */}
                      <h4 className="text-xs font-bold text-gray-100 line-clamp-1" title={period.subjectName}>
                        {period.subjectName || period.subjectCode}
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400 block">
                        {period.subjectCode}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-gray-400">
                      {/* Venue / Room */}
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                        <span className="truncate">
                          {period.resourceName || period.resourceCode || 'Classroom TBA'}
                        </span>
                        {period.resourceCategory && (
                          <span className="text-[9px] text-gray-400 font-mono">
                            ({period.resourceCategory})
                          </span>
                        )}
                      </div>

                      {/* Instructor */}
                      {period.facultyName && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <User className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{period.facultyName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
