import React from 'react';
import { Card } from '../../ui';
import { Button } from '../../ui';
import { Pagination } from '../../ui/Pagination';
import { StudentResourceRequest } from '../../../types/studentResourceRequest';
import { StudentRequestStatusBadge, StudentRequestPriorityBadge } from './StudentRequestBadges';
import { Calendar, Clock, MapPin, Eye, Ban, Building2 } from 'lucide-react';

interface Props {
  requests: StudentResourceRequest[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onViewDetails: (request: StudentResourceRequest) => void;
  onCancelRequest: (request: StudentResourceRequest) => void;
}

export const StudentRequestList: React.FC<Props> = ({
  requests,
  totalElements,
  totalPages,
  page,
  size,
  onPageChange,
  onViewDetails,
  onCancelRequest,
}) => {
  return (
    <Card className="bg-[#11141C] border-[#1E2330] overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E2330] bg-[#171A23]/50 text-[11px] font-semibold uppercase tracking-wider text-gray-400 font-mono">
              <th className="py-3 px-4">Req #</th>
              <th className="py-3 px-4">Resource & Category</th>
              <th className="py-3 px-4">Required Schedule</th>
              <th className="py-3 px-4">Purpose</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2330] text-xs">
            {requests.map((req) => {
              const isPending = req.status === 'PENDING';

              return (
                <tr
                  key={req.id}
                  className="hover:bg-[#171A23]/40 transition-colors group"
                >
                  {/* Req # */}
                  <td className="py-3.5 px-4 font-mono font-medium text-gray-300">
                    #{req.id}
                  </td>

                  {/* Resource */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        {req.resourceName || 'Unnamed Resource'}
                        {req.resourceCode && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171A23] text-gray-400 border border-[#222838]">
                            {req.resourceCode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        {req.categoryName && (
                          <span>{req.categoryName}</span>
                        )}
                        {req.resourceLocation && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              {req.resourceLocation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Date & Schedule */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 text-gray-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>{req.requestedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>
                          {req.startTime} - {req.endTime}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Purpose */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-gray-300 truncate" title={req.purpose}>
                      {req.purpose}
                    </p>
                    {req.description && (
                      <p className="text-[11px] text-gray-500 truncate" title={req.description}>
                        {req.description}
                      </p>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <StudentRequestPriorityBadge priority={req.priority} />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StudentRequestStatusBadge status={req.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onViewDetails(req)}
                        leftIcon={<Eye className="w-3 h-3" />}
                        className="text-gray-300 hover:text-white"
                      >
                        Details
                      </Button>

                      {isPending && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onCancelRequest(req)}
                          leftIcon={<Ban className="w-3 h-3" />}
                          className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="block lg:hidden divide-y divide-[#1E2330]">
        {requests.map((req) => {
          const isPending = req.status === 'PENDING';

          return (
            <div key={req.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-gray-400">
                      #{req.id}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {req.resourceName || 'Unnamed Resource'}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {req.categoryName} {req.resourceLocation ? `• ${req.resourceLocation}` : ''}
                  </p>
                </div>
                <StudentRequestStatusBadge status={req.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#171A23] p-2.5 rounded-lg">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>{req.requestedDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{req.startTime} - {req.endTime}</span>
                </div>
              </div>

              <div className="text-xs text-gray-300">
                <span className="text-gray-500 font-medium">Purpose: </span>
                {req.purpose}
              </div>

              <div className="flex items-center justify-between pt-1">
                <StudentRequestPriorityBadge priority={req.priority} />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onViewDetails(req)}
                    leftIcon={<Eye className="w-3 h-3" />}
                    className="border-[#222838]"
                  >
                    Details
                  </Button>
                  {isPending && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onCancelRequest(req)}
                      leftIcon={<Ban className="w-3 h-3" />}
                      className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-[#1E2330]">
        <Pagination
          currentPage={page + 1}
          totalPages={Math.max(1, totalPages)}
          totalRecords={totalElements}
          pageSize={size}
          onPageChange={(p) => onPageChange(p - 1)}
        />
      </div>
    </Card>
  );
};
