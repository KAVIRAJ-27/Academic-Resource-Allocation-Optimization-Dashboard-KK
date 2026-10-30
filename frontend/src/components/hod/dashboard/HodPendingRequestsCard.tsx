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
    <Card className="p-6 border border-[#D8C9A8] bg-white shadow-none rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FBF9F3] text-[#A87928] border border-[#E8E0D0]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#202020]">Pending Resource Requests</h3>
              <p className="text-xs text-[#77736A]">Department faculty resource requisitions</p>
            </div>
          </div>
          <Badge
            variant={pendingRequests.length > 0 ? 'warning' : 'neutral'}
            size="md"
          >
            {pendingRequests.length} Pending
          </Badge>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-10 text-center text-[#77736A] text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 text-[#77736A] opacity-60" />
            <p className="font-serif font-bold text-[#202020]">No Pending Requests</p>
            <p className="text-[#77736A] mt-0.5">
              All department academic resource requests have been reviewed and processed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.requestId}
                className="p-3.5 rounded bg-[#FBF9F3] border border-[#E8E0D0] hover:bg-[#F4F0E6] hover:border-[#D8C9A8] transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#202020]">{req.resourceName}</span>
                      <span className="text-[10px] font-mono text-[#77736A] bg-white border border-[#D9D2C3] px-1.5 py-0.5 rounded">
                        {req.resourceCode}
                      </span>
                    </div>
                    <p className="text-[#555555] mt-1 line-clamp-1">{req.purpose}</p>
                  </div>
                  <div className="shrink-0">
                    {getPriorityBadge(req.priority)}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#E8E0D0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#77736A]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[#202020] font-medium">
                      <User className="w-3 h-3 text-[#3F7655]" />
                      {req.requesterName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#77736A]">
                      <Calendar className="w-3 h-3 text-[#B8A16A]" />
                      {req.requestedDate}
                    </span>
                  </div>
                  <span className="text-[#77736A] font-mono font-medium">
                    {req.startTime} - {req.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E8E0D0] flex items-center justify-between text-xs text-[#77736A]">
        <span>Recent requests requiring administrative attention</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/hod/allocations')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-[#A87928] hover:text-[#202020] p-0 font-medium"
        >
          View Resource Management
        </Button>
      </div>
    </Card>
  );
};
