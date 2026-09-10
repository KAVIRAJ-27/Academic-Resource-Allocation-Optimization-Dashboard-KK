import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodPendingResourceRequestItem } from '../../../types/hod';
import {
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight,
  User,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HodPendingRequestsCardProps {
  pendingRequests: HodPendingResourceRequestItem[];
}

export const HodPendingRequestsCard: React.FC<HodPendingRequestsCardProps> = ({
  pendingRequests,
}) => {
  const navigate = useNavigate();

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
      case 'HIGH':
        return <Badge variant="orange">{priority}</Badge>;
      case 'MEDIUM':
        return <Badge variant="purple">{priority}</Badge>;
      case 'LOW':
      default:
        return <Badge variant="neutral">{priority || 'NORMAL'}</Badge>;
    }
  };

  return (
    <Card className="p-6 border border-gray-800 bg-gray-900/40 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Pending Resource Requests</h3>
              <p className="text-xs text-gray-400">Department faculty resource requisitions</p>
            </div>
          </div>
          <Badge
            variant={pendingRequests.length > 0 ? 'orange' : 'teal'}
            size="md"
          >
            {pendingRequests.length} Pending
          </Badge>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600 opacity-60" />
            <p className="font-medium text-gray-300">No Pending Requests</p>
            <p className="text-gray-500 mt-0.5">
              All department academic resource requests have been reviewed and processed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.requestId}
                className="p-3 rounded-xl bg-gray-800/40 border border-gray-800/80 hover:border-gray-700/80 transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{req.resourceName}</span>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                        {req.resourceCode}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1 line-clamp-1">{req.purpose}</p>
                  </div>
                  <div className="shrink-0">
                    {getPriorityBadge(req.priority)}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-gray-300">
                      <User className="w-3 h-3 text-teal-400" />
                      {req.requesterName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      {req.requestedDate}
                    </span>
                  </div>
                  <span className="text-gray-400 font-mono">
                    {req.startTime} - {req.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
        <span>Recent requests requiring administrative attention</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/hod/allocations')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-orange-400 hover:text-orange-300 p-0"
        >
          View Resource Management
        </Button>
      </div>
    </Card>
  );
};
