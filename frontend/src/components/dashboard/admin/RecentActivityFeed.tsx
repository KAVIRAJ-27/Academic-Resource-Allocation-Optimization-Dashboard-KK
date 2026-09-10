import React from 'react';
import { Clock, Shield, User, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, EmptyState } from '../../ui';
import { RecentActivityItem } from '../../../types/dashboard';

interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
  loading: boolean;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="p-5 h-full min-h-[320px] animate-pulse bg-[#11141C] border-[#1E2330]">
        <div className="h-4 bg-[#1E2330] rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-[#1E2330]/40 rounded-xl"></div>
          <div className="h-10 bg-[#1E2330]/40 rounded-xl"></div>
          <div className="h-10 bg-[#1E2330]/40 rounded-xl"></div>
        </div>
      </Card>
    );
  }

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getActionBadgeClass = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return 'bg-teal-500/10 text-teal-300 border-teal-500/20';
    }
    if (act.includes('CREATE') || act.includes('ADD')) {
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
    if (act.includes('UPDATE') || act.includes('STATUS')) {
      return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('FAILED')) {
      return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
    }
    return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <CardHeader className="p-0 pb-3 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            Recent System Activity
          </CardTitle>
          <CardDescription className="text-xs text-gray-400 mt-0.5">
            Immutable audit log stream of institutional actions
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-teal-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          Live Audit
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[360px] my-2 pr-1">
        {activities.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="No administrative actions or authentication audit events have been logged yet."
            icon={Clock}
            compact
          />
        ) : (
          <div className="space-y-2">
            {activities.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-[#171A23]/60 border border-[#1E2330] hover:border-[#2E3547] transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border uppercase shrink-0 ${getActionBadgeClass(
                      item.action
                    )}`}
                  >
                    {item.action}
                  </span>
                  <div className="min-w-0">
                    <p className="text-gray-200 font-medium truncate">{item.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-500" />
                        {item.username}
                      </span>
                      <span>·</span>
                      <span>{item.entityType}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-[10px] font-mono text-gray-400 text-right">
                  {formatTime(item.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <div className="pt-3 border-t border-[#1E2330] text-[10px] text-gray-500 font-mono flex items-center justify-between">
        <span>Audit Trail: Immutable SHA Log</span>
        <span>Showing latest {activities.length} records</span>
      </div>
    </Card>
  );
};
