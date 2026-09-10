import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState, Button } from '../../ui';
import { FacultyTimetableClass } from '../../../types/faculty';
import { Clock, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';

interface FacultyTimetableCardProps {
  timetable?: FacultyTimetableClass[];
}

export const FacultyTimetableCard: React.FC<FacultyTimetableCardProps> = ({ timetable = [] }) => {
  const navigate = useNavigate();

  if (!timetable || timetable.length === 0) {
    return (
      <Card className="h-full bg-[#11141C] border-[#1E2330] flex flex-col">
        <CardHeader className="border-b border-[#1E2330] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              Upcoming Scheduled Classes
            </CardTitle>
            <Badge variant="neutral">0 Periods</Badge>
          </div>
          <CardDescription>
            Live weekly instructional calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="Timetable information will appear here when available."
            description="Your weekly lecture schedule and room reservations will be displayed once the department timetable is published."
            icon={Clock}
            compact
          />
        </CardContent>
      </Card>
    );
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  return (
    <Card className="h-full bg-[#11141C] border-[#1E2330] flex flex-col shadow-card hover:border-[#2A3245] transition-all">
      <CardHeader className="border-b border-[#1E2330] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              Instruction Timetable Matrix
            </CardTitle>
            <CardDescription>
              {timetable.length} weekly instructional {timetable.length === 1 ? 'session' : 'sessions'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="teal">{timetable.length} Classes</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/faculty/timetable')}
              className="text-teal-400 hover:text-teal-300 text-xs px-2 py-1 h-auto"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2.5 overflow-y-auto max-h-[360px]">
        {timetable.map((t) => (
          <div
            key={t.id}
            className="p-3 bg-[#0E1017] border border-[#1E2330] rounded-xl hover:border-teal-500/30 transition-all flex items-center justify-between gap-3"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-teal-300">
                  {t.subjectCode}
                </span>
                <span className="text-xs font-medium text-white truncate max-w-[200px]" title={t.subjectName}>
                  {t.subjectName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-gray-300">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  {t.dayOfWeek}
                </span>
                {t.roomNumber && (
                  <span className="flex items-center gap-1 text-teal-400">
                    <MapPin className="w-3 h-3" />
                    {t.roomNumber} {t.roomName ? `(${t.roomName})` : ''}
                  </span>
                )}
                {t.sectionName && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-500" />
                    Sec {t.sectionName}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="font-mono text-xs font-bold text-white bg-[#171A23] px-2.5 py-1 rounded-lg border border-[#262C3D] block">
                {formatTime(t.startTime)} - {formatTime(t.endTime)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
