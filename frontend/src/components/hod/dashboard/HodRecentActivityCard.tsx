import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { HodActivityItem } from '../../../types/hod';
import {
  History,
  Activity,
  User,
  Clock,
} from 'lucide-react';

interface HodRecentActivityCardProps {
  activities: HodActivityItem[];
}

export const HodRecentActivityCard: React.FC<HodRecentActivityCardProps> = ({
  activities,
}) => {
  const formatTimeAgo = (isoString: string) => {
    if (!isoString) return 'recently';
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'recently';
    }
  };

  return (
    <Card className="p-6 border border-[#D8C9A8] bg-white shadow-none rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FBF9F3] text-[#B8A16A] border border-[#E8E0D0]">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#202020]">Department Activity Log</h3>
              <p className="text-xs text-[#77736A]">Live audit telemetry of department operations</p>
            </div>
          </div>
          <Badge variant="neutral" size="md">
            Live Stream
          </Badge>
        </div>

        {activities.length === 0 ? (
          <div className="py-10 text-center text-[#77736A] text-xs">
            <Activity className="w-8 h-8 mx-auto mb-2 text-[#77736A] opacity-60" />
            <p className="font-serif font-bold text-[#202020]">No Recorded Activity</p>
            <p className="text-[#77736A] mt-0.5">
              No recent audit events logged for department faculty or resources.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 7).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded bg-[#FBF9F3] border border-[#E8E0D0] hover:bg-[#F4F0E6] hover:border-[#D8C9A8] transition-colors text-xs"
              >
                <div className="p-2 rounded bg-white border border-[#D8C9A8] text-[#B8A16A] shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#202020] truncate">
                      {act.action?.replace('_', ' ') || 'Action'}
                    </span>
                    <span className="text-[10px] text-[#77736A] shrink-0 inline-flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(act.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#555555] text-[11px] mt-0.5 truncate">{act.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#77736A]">
                    <span className="inline-flex items-center gap-1 text-[#3F7655] font-medium">
                      <User className="w-2.5 h-2.5" />
                      {act.performedBy}
                    </span>
                    <span>•</span>
                    <span className="text-[#77736A] uppercase font-mono">{act.entityType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
