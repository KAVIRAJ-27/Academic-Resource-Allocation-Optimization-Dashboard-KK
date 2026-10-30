import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, EmptyState } from '../../ui';
import { FacultyTimetableEntry } from '../../../types/faculty';
import { Clock, MapPin, Users, BookOpen, Calendar } from 'lucide-react';

interface FacultyTimetableScheduleViewProps {
  entries: FacultyTimetableEntry[];
}

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const FacultyTimetableScheduleView: React.FC<FacultyTimetableScheduleViewProps> = ({
  entries = [],
}) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-card">
        <EmptyState
          icon={Calendar}
          title="No timetable entries are currently available."
          description="There are no scheduled teaching slots matching the selected filter criteria."
        />
      </div>
    );
  }

  // Group entries by dayOfWeek
  const groupedByDay: Record<string, FacultyTimetableEntry[]> = {};
  entries.forEach((e) => {
    const day = (e.dayOfWeek || 'UNSPECIFIED').toUpperCase();
    if (!groupedByDay[day]) {
      groupedByDay[day] = [];
    }
    groupedByDay[day].push(e);
  });

  // Sort days in natural week order
  const sortedDays = Object.keys(groupedByDay).sort((a, b) => {
    const indexA = DAY_ORDER.indexOf(a);
    const indexB = DAY_ORDER.indexOf(b);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      {sortedDays.map((day) => {
        const dayEntries = groupedByDay[day];
        return (
          <div key={day} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 capitalize">
                  {day.toLowerCase()}
                </h3>
              </div>
              <Badge variant="neutral" size="sm">
                {dayEntries.length} {dayEntries.length === 1 ? 'Period' : 'Periods'}
              </Badge>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-teal-500/30 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                      </span>
                      {entry.sectionName && (
                        <Badge variant="neutral" size="sm">
                          Section {entry.sectionName}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="font-semibold text-gray-300">{entry.subjectCode}</span>
                        {entry.programCode && <span>• {entry.programCode}</span>}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 pt-0.5">
                        {entry.subjectName}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span className="font-medium text-gray-200 truncate">
                        {entry.resourceName || entry.resourceCode || 'Classroom'}
                      </span>
                    </div>
                    {entry.resourceLocation && (
                      <span className="text-[11px] text-gray-500 truncate max-w-[120px]">
                        {entry.resourceLocation}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
