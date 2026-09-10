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
    <Card className="p-6 border border-gray-800 bg-gray-900/40 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Department Activity Log</h3>
              <p className="text-xs text-gray-400">Live audit telemetry of department operations</p>
            </div>
          </div>
          <Badge variant="purple" size="md">
            Live Stream
          </Badge>
        </div>

        {activities.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-xs">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-600 opacity-60" />
            <p className="font-medium text-gray-300">No Recorded Activity</p>
            <p className="text-gray-500 mt-0.5">
              No recent audit events logged for department faculty or resources.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 7).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-800/30 border border-gray-800/60 hover:bg-gray-800/50 transition-colors text-xs"
              >
                <div className="p-2 rounded-lg bg-gray-800 border border-gray-700/60 text-purple-400 shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white truncate">
                      {act.action?.replace('_', ' ') || 'Action'}
                    </span>
                    <span className="text-[10px] text-gray-500 shrink-0 inline-flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(act.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] mt-0.5 truncate">{act.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                    <span className="inline-flex items-center gap-1 text-teal-400">
                      <User className="w-2.5 h-2.5" />
                      {act.performedBy}
                    </span>
                    <span>•</span>
                    <span className="text-gray-400 uppercase font-mono">{act.entityType}</span>
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
