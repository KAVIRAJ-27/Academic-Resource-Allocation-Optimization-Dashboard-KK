import React from 'react';
import { AnalyticsFilterParams } from '../../types/analytics';
import { Calendar, Filter, RefreshCw, X } from 'lucide-react';

interface AnalyticsFilterBarProps {
  filters: AnalyticsFilterParams;
  onChange: (filters: AnalyticsFilterParams) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  showDepartmentFilter?: boolean;
  showHostelFilter?: boolean;
  departments?: { id: number; name: string }[];
  hostels?: { id: number; name: string }[];
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  filters,
  onChange,
  onRefresh,
  isLoading = false,
  showDepartmentFilter = true,
  showHostelFilter = true,
  departments = [],
  hostels = [],
}) => {
  const handlePresetChange = (preset: string) => {
    const today = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      startDate = formatDate(today);
      endDate = formatDate(today);
    } else if (preset === 'LAST_7_DAYS') {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      startDate = formatDate(past);
      endDate = formatDate(today);
    } else if (preset === 'LAST_30_DAYS') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      startDate = formatDate(past);
      endDate = formatDate(today);
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = formatDate(firstDay);
      endDate = formatDate(today);
    } else if (preset === 'ALL') {
      startDate = undefined;
      endDate = undefined;
    }

    onChange({
      ...filters,
      preset,
      startDate,
      endDate,
    });
  };

  const handleClear = () => {
    onChange({
      preset: 'ALL',
      startDate: undefined,
      endDate: undefined,
      departmentId: undefined,
      hostelId: undefined,
      status: undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Filter className="h-3.5 w-3.5 text-teal-400" />
          <span>Filters:</span>
        </div>

        {/* Preset Selector */}
        <select
          value={filters.preset || 'ALL'}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-200 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        >
          <option value="ALL">All Time</option>
          <option value="TODAY">Today</option>
          <option value="LAST_7_DAYS">Last 7 Days</option>
          <option value="LAST_30_DAYS">Last 30 Days</option>
          <option value="THIS_MONTH">This Month</option>
          <option value="CUSTOM">Custom Range</option>
        </select>

        {/* Custom Date Pickers */}
        {filters.preset === 'CUSTOM' && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
                className="bg-transparent text-xs text-slate-200 outline-none"
              />
            </div>
            <span className="text-xs text-slate-500">to</span>
            <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-300">
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
                className="bg-transparent text-xs text-slate-200 outline-none"
              />
            </div>
          </div>
        )}

        {/* Department Filter */}
        {showDepartmentFilter && departments.length > 0 && (
          <select
            value={filters.departmentId || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                departmentId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-200 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {/* Hostel Filter */}
        {showHostelFilter && hostels.length > 0 && (
          <select
            value={filters.hostelId || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                hostelId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-200 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {(filters.preset !== 'ALL' || filters.departmentId || filters.hostelId) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 rounded-xl border border-slate-700/60 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-300 transition hover:bg-teal-500/20 active:scale-95 disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>
  );
};
