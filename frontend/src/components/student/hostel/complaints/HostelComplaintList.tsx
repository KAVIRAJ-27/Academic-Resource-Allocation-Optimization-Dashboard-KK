import React from 'react';
import { Card, Button } from '../../../ui';
import { StudentHostelComplaint } from '../../../../types/studentHostelComplaint';
import {
  ComplaintStatusBadge,
  ComplaintPriorityBadge,
  ComplaintCategoryBadge,
} from './HostelComplaintBadges';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  complaints: StudentHostelComplaint[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onViewDetails: (complaint: StudentHostelComplaint) => void;
}

export const HostelComplaintList: React.FC<Props> = ({
  complaints,
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  onViewDetails,
}) => {
  return (
    <Card className="bg-white border-slate-200 overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-[#0C0E14]/70">
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider">
                Complaint ID
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider">
                Category
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider">
                Title / Description
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider">
                Submitted
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider">
                Priority
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {complaints.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onViewDetails(c)}
              >
                <td className="py-3.5 px-4 font-mono text-xs font-semibold text-teal-400">
                  #HC-{String(c.id).padStart(4, '0')}
                </td>
                <td className="py-3.5 px-4">
                  <ComplaintCategoryBadge category={c.category} />
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <p className="text-xs font-medium text-white truncate">{c.title}</p>
                  <p className="text-[11px] text-slate-600 font-medium truncate">{c.description}</p>
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                  {new Date(c.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <ComplaintPriorityBadge priority={c.priority} />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <ComplaintStatusBadge status={c.status} />
                </td>
                <td
                  className="py-3.5 px-4 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(c)}
                    className="text-slate-600 font-medium hover:text-white h-7 px-2"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {complaints.map((c) => (
          <div
            key={c.id}
            className="p-4 space-y-3 hover:bg-slate-50 transition-colors"
            onClick={() => onViewDetails(c)}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-teal-400">
                #HC-{String(c.id).padStart(4, '0')}
              </span>
              <ComplaintStatusBadge status={c.status} />
            </div>

            <div className="flex items-center gap-2">
              <ComplaintCategoryBadge category={c.category} />
              <ComplaintPriorityBadge priority={c.priority} />
            </div>

            <div>
              <p className="text-xs font-medium text-white">{c.title}</p>
              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{c.description}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span>{c.hostelName || 'Hostel'}</span>
              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>

            <div
              className="flex items-center justify-end pt-2 border-t border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(c)}
                className="border-slate-200 text-gray-300 h-7 text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-200 bg-[#0C0E14]/40">
        <span className="text-xs text-gray-400">
          Showing <span className="font-medium text-white">{complaints.length}</span> of{' '}
          <span className="font-medium text-white">{totalElements}</span> complaints
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="border-slate-200 text-gray-300 h-8 px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-400 px-2">
              Page <span className="text-white font-medium">{page + 1}</span> of{' '}
              <span className="text-white font-medium">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="border-slate-200 text-gray-300 h-8 px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
