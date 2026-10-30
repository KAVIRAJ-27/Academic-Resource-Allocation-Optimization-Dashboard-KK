import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyResourceRequestItem } from '../../../types/faculty';
import { Badge, Button, EmptyState } from '../../ui';
import { FileText, Eye, Ban, Calendar, Clock, MapPin } from 'lucide-react';

interface FacultyRequestTableProps {
  requests: FacultyResourceRequestItem[];
  onCancelClick: (request: FacultyResourceRequestItem) => void;
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export const FacultyRequestTable: React.FC<FacultyRequestTableProps> = ({
  requests,
  onCancelClick,
  hasFilters,
  onClearFilters,
}) => {
  const navigate = useNavigate();

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-card">
        <EmptyState
          icon={FileText}
          title={hasFilters ? 'No resource requests match your filters.' : "You haven't submitted any resource requests yet."}
          description={
            hasFilters
              ? 'Try adjusting your status or search filters to locate the desired request.'
              : 'Submit a new academic resource request to reserve specialized classrooms, labs, or teaching equipment.'
          }
          actionLabel={hasFilters ? 'Clear Filters' : 'Create Request'}
          onAction={hasFilters ? onClearFilters : () => navigate('/faculty/resource-requests/new')}
        />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge variant="blue">Completed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return <Badge variant="danger">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="orange">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="blue">Medium</Badge>;
      case 'LOW':
        return <Badge variant="gray">Low</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 font-bold uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">Req ID</th>
              <th scope="col" className="px-5 py-3.5">Resource</th>
              <th scope="col" className="px-5 py-3.5">Purpose & Context</th>
              <th scope="col" className="px-5 py-3.5">Requested Slot</th>
              <th scope="col" className="px-5 py-3.5">Priority</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {requests.map((req) => {
              const isPending = req.status?.toUpperCase() === 'PENDING';

              return (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/faculty/resource-requests/${req.id}`)}
                >
                  <td className="px-5 py-4 font-mono text-xs font-medium text-slate-600 font-medium">
                    #{req.id}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white group-hover:text-teal-300 transition-colors">
                      {req.resourceName || 'Resource'}
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-slate-600 font-medium">{req.resourceCode}</span>
                      {req.resourceLocation && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {req.resourceLocation}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <div className="text-sm font-medium text-slate-800 font-medium truncate">
                      {req.purpose}
                    </div>
                    {req.subjectName && (
                      <div className="text-xs text-teal-400/80 mt-0.5 truncate">
                        {req.subjectCode ? `${req.subjectCode} - ` : ''}{req.subjectName}
                        {req.sectionName ? ` (Sec ${req.sectionName})` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-white text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-600 font-medium" />
                      <span>{req.requestedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500 font-medium" />
                      <span>
                        {req.startTime?.substring(0, 5)} - {req.endTime?.substring(0, 5)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getPriorityBadge(req.priority)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/faculty/resource-requests/${req.id}`)}
                        className="text-xs text-slate-600 font-medium hover:text-white"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isPending && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancelClick(req)}
                          className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          title="Cancel Request"
                        >
                          <Ban className="w-4 h-4" />
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

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {requests.map((req) => {
          const isPending = req.status?.toUpperCase() === 'PENDING';

          return (
            <div
              key={req.id}
              className="p-4 space-y-3 cursor-pointer hover:bg-slate-50"
              onClick={() => navigate(`/faculty/resource-requests/${req.id}`)}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400">#{req.id}</span>
                <div className="flex items-center gap-1.5">
                  {getPriorityBadge(req.priority)}
                  {getStatusBadge(req.status)}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-900 text-base">
                  {req.resourceName}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {req.purpose}
                </div>
              </div>

              <div className="text-xs text-gray-400 flex items-center justify-between pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{req.requestedDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{req.startTime?.substring(0, 5)} - {req.endTime?.substring(0, 5)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/faculty/resource-requests/${req.id}`)}
                  className="text-xs"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View Details
                </Button>
                {isPending && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onCancelClick(req)}
                    className="text-xs"
                  >
                    <Ban className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
