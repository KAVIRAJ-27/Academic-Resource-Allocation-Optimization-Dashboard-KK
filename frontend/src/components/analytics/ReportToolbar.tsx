import React, { useState } from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import { AnalyticsFilterParams } from '../../types/analytics';

interface ReportToolbarProps {
  onExport: (reportType: string) => Promise<void>;
  filters: AnalyticsFilterParams;
}

const REPORT_OPTIONS = [
  { id: 'ACADEMIC_RESOURCES', label: 'Academic Resource Utilization Report' },
  { id: 'ACADEMIC_ALLOCATIONS', label: 'Academic Allocations Summary' },
  { id: 'DEPARTMENT_SUMMARY', label: 'Department Analytics & Resource Balance' },
  { id: 'FACULTY_WORKLOAD', label: 'Faculty Teaching & Workload Audit' },
  { id: 'HOSTEL_OCCUPANCY', label: 'Hostel Living & Bed Occupancy Report' },
  { id: 'HOSTEL_COMPLAINTS', label: 'Hostel Grievances & Resolution Report' },
  { id: 'MAINTENANCE_REQUESTS', label: 'Facility Maintenance Work Orders' },
];

export const ReportToolbar: React.FC<ReportToolbarProps> = ({ onExport }) => {
  const [selectedReport, setSelectedReport] = useState<string>('ACADEMIC_RESOURCES');
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setIsSuccess(false);
    try {
      await onExport(selectedReport);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D8C9A8] bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8C9A8] bg-[#F4F0E6] text-[#B8A16A]">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-serif font-bold text-[#202020]">Generate Institutional Reports</h4>
          <p className="text-xs font-normal text-[#555555]">
            Export audit-ready CSV packages reflecting current database records and applied filters.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="rounded-xl border border-[#D9D2C3] bg-white px-3.5 py-2 text-xs font-semibold text-[#202020] shadow-xs outline-none transition focus:border-[#B8A16A] focus:ring-1 focus:ring-[#B8A16A]"
        >
          {REPORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 ${
            isSuccess
              ? 'bg-[#EEF6F1] text-[#3F7655] border border-[#C1DFCD]'
              : 'bg-[#B8A16A] text-[#202020] border border-[#A38C57] hover:bg-[#A38C57]'
          }`}
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-[#3F7655]" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
