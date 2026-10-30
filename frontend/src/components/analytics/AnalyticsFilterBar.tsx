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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D8C9A8] bg-white p-3.5 shadow-card">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#202020]">
          <Filter className="h-3.5 w-3.5 text-[#B8A16A]" />
          <span>Filters:</span>
        </div>

        {/* Preset Selector */}
        <select
          value={filters.preset || 'ALL'}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="rounded-xl border border-[#D9D2C3] bg-white px-3 py-1.5 text-xs text-[#202020] font-medium outline-none transition focus:border-[#B8A16A] focus:ring-1 focus:ring-[#B8A16A] shadow-xs"
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
            <div className="flex items-center gap-1 rounded-xl border border-[#D9D2C3] bg-white px-2 py-1 text-xs text-[#202020]">
              <Calendar className="h-3.5 w-3.5 text-[#77736A]" />
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
                className="bg-transparent text-xs text-[#202020] outline-none"
              />
            </div>
            <span className="text-xs text-[#77736A]">to</span>
            <div className="flex items-center gap-1 rounded-xl border border-[#D9D2C3] bg-white px-2 py-1 text-xs text-[#202020]">
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
                className="bg-transparent text-xs text-[#202020] outline-none"
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
            className="rounded-xl border border-[#D9D2C3] bg-white px-3 py-1.5 text-xs text-[#202020] font-medium outline-none transition focus:border-[#B8A16A] focus:ring-1 focus:ring-[#B8A16A] shadow-xs"
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
            className="rounded-xl border border-[#D9D2C3] bg-white px-3 py-1.5 text-xs text-[#202020] font-medium outline-none transition focus:border-[#B8A16A] focus:ring-1 focus:ring-[#B8A16A] shadow-xs"
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
            className="flex items-center gap-1 rounded-xl border border-[#E8E0D0] bg-[#F8F6F0] px-2.5 py-1 text-xs text-[#555555] hover:bg-[#F4F0E6] font-medium transition-colors"
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
        className="flex items-center gap-1.5 rounded-xl border border-[#A38C57] bg-[#B8A16A] px-3.5 py-1.5 text-xs font-semibold text-[#202020] transition hover:bg-[#A38C57] active:scale-95 disabled:opacity-50 shadow-xs"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>
  );
};
