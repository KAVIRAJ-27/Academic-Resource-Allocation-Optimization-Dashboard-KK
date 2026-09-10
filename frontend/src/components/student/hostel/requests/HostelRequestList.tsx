import React from 'react';
import { Card, Button } from '../../../ui';
import { StudentHostelRequest } from '../../../../types/studentHostelRequest';
import {
  RequestStatusBadge,
  RequestPriorityBadge,
  RequestTypeBadge,
} from './HostelRequestBadges';
import { Eye, Ban, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  requests: StudentHostelRequest[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onViewDetails: (request: StudentHostelRequest) => void;
  onCancelRequest?: (id: number) => void;
}

export const HostelRequestList: React.FC<Props> = ({
  requests,
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  onViewDetails,
  onCancelRequest,
}) => {
  return (
    <Card className="bg-[#11141C] border-[#1E2330] overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E2330] bg-[#0C0E14]/70">
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Request ID
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Submitted
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2330]">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-[#151923] transition-colors cursor-pointer"
                onClick={() => onViewDetails(req)}
              >
                <td className="py-3.5 px-4 font-mono text-xs font-semibold text-teal-400">
                  #HR-{String(req.id).padStart(4, '0')}
                </td>
                <td className="py-3.5 px-4">
                  <RequestTypeBadge type={req.requestType} />
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <p className="text-xs text-gray-300 truncate">
                    {req.description}
                  </p>
                  {req.hostelName && (
                    <span className="text-[11px] text-gray-500">
                      {req.hostelName} {req.roomNumber ? `• Room ${req.roomNumber}` : ''}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(req.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <RequestPriorityBadge priority={req.priority} />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <RequestStatusBadge status={req.status} />
                </td>
                <td
                  className="py-3.5 px-4 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(req)}
                      className="text-gray-400 hover:text-white h-7 px-2"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    {req.status === 'PENDING' && onCancelRequest && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelRequest(req.id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 px-2"
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-[#1E2330]">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-4 space-y-3 hover:bg-[#151923] transition-colors"
            onClick={() => onViewDetails(req)}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-teal-400">
                #HR-{String(req.id).padStart(4, '0')}
              </span>
              <RequestStatusBadge status={req.status} />
            </div>

            <div className="flex items-center gap-2">
              <RequestTypeBadge type={req.requestType} />
              <RequestPriorityBadge priority={req.priority} />
            </div>

            <p className="text-xs text-gray-300 line-clamp-2">{req.description}</p>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span>{req.hostelName || 'Hostel'}</span>
              <span>{new Date(req.createdAt).toLocaleDateString()}</span>
            </div>

            <div
              className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E2330]"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(req)}
                className="border-[#222838] text-gray-300 h-7 text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Details
              </Button>
              {req.status === 'PENDING' && onCancelRequest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancelRequest(req.id)}
                  className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 h-7 text-xs"
                >
                  <Ban className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[#1E2330] bg-[#0C0E14]/40">
        <span className="text-xs text-gray-400">
          Showing <span className="font-medium text-white">{requests.length}</span> of{' '}
          <span className="font-medium text-white">{totalElements}</span> requests
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="border-[#222838] text-gray-300 h-8 px-2"
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
              className="border-[#222838] text-gray-300 h-8 px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
