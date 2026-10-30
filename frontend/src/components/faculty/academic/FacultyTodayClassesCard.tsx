import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState } from '../../ui';
import { FacultyTimetableEntry } from '../../../types/faculty';
import { Clock, MapPin, Users, CalendarCheck, BookOpen } from 'lucide-react';

interface FacultyTodayClassesCardProps {
  todayEntries: FacultyTimetableEntry[];
  todayDayOfWeek?: string;
  todayDate?: string;
}

export const FacultyTodayClassesCard: React.FC<FacultyTodayClassesCardProps> = ({
  todayEntries = [],
  todayDayOfWeek,
  todayDate,
}) => {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  return (
    <Card className="bg-white border-slate-200 shadow-card mb-6">
      <CardHeader className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-teal-400" />
              Today's Scheduled Classes
            </CardTitle>
            <CardDescription>
              {todayDayOfWeek ? (
                <span className="capitalize">{todayDayOfWeek.toLowerCase()}</span>
              ) : (
                'Today'
              )}
              {todayDate ? ` • ${todayDate}` : ''}
            </CardDescription>
          </div>
          <Badge variant={todayEntries.length > 0 ? 'teal' : 'neutral'}>
            {todayEntries.length} {todayEntries.length === 1 ? 'Period' : 'Periods'} Scheduled
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {todayEntries.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No classes scheduled for today."
            description="You have no lectures or laboratory sessions scheduled for the current day. Enjoy your prep and research time."
            compact
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500/30 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    <Clock className="w-3 h-3" />
                    {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                  </span>
                  {entry.sectionName && (
                    <Badge variant="neutral" size="sm">
                      Sec {entry.sectionName}
                    </Badge>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400">{entry.subjectCode}</span>
                    {entry.subjectType && (
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                        • {entry.subjectType}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate pt-0.5">
                    {entry.subjectName}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span className="truncate">
                      {entry.resourceName || entry.resourceCode || 'Classroom / Lab'}
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
        )}
      </CardContent>
    </Card>
  );
};
