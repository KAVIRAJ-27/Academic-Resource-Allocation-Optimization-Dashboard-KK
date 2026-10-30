import React from 'react';
import { Calendar, RotateCcw, Filter, CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui';

interface FacultyTimetableFiltersProps {
  dayOfWeek: string;
  onDayChange: (day: string) => void;
  todayOnly: boolean;
  onTodayOnlyToggle: () => void;
  todayDayOfWeek?: string;
  onReset: () => void;
}

const DAYS = ['ALL', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const FacultyTimetableFilters: React.FC<FacultyTimetableFiltersProps> = ({
  dayOfWeek,
  onDayChange,
  todayOnly,
  onTodayOnlyToggle,
  todayDayOfWeek,
  onReset,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-bold text-white">Filter Timetable Schedule</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={todayOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={onTodayOnlyToggle}
            className={`text-xs ${
              todayOnly
                ? 'bg-teal-500 hover:bg-teal-600 text-black font-semibold'
                : 'border-slate-200 text-gray-300 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Today's Classes Only
          </Button>

          {(dayOfWeek !== 'ALL' || todayOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-gray-400 hover:text-white text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Day pill buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map((d) => {
          const isSelected = !todayOnly && dayOfWeek === d;
          const isCurrentToday = todayDayOfWeek && d === todayDayOfWeek;

          return (
            <button
              key={d}
              disabled={todayOnly}
              onClick={() => onDayChange(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                todayOnly
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 text-gray-500 border border-slate-200'
                  : isSelected
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'bg-slate-50 text-gray-400 hover:text-gray-200 hover:bg-[#1C212E] border border-slate-200'
              }`}
            >
              <span className="capitalize">{d === 'ALL' ? 'All Days' : d.toLowerCase()}</span>
              {isCurrentToday && (
                <span className="ml-1.5 text-[10px] px-1 py-0.2 rounded bg-teal-500/20 text-teal-400 font-bold">
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
