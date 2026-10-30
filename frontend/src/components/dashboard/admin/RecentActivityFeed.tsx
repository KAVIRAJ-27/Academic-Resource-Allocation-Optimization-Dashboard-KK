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
      <Card className="p-5 h-full min-h-[320px] animate-pulse bg-white border-[#E8E0D0]">
        <div className="h-4 bg-[#F4F0E6] rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-[#FBF9F3] rounded"></div>
          <div className="h-10 bg-[#FBF9F3] rounded"></div>
          <div className="h-10 bg-[#FBF9F3] rounded"></div>
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
      return 'bg-[#F4F0E6] text-[#B8A16A] border-[#D8C9A8]';
    }
    if (act.includes('CREATE') || act.includes('ADD')) {
      return 'bg-[#F0F5F2] text-[#3F7655] border-[#B6D1C1]';
    }
    if (act.includes('UPDATE') || act.includes('STATUS')) {
      return 'bg-[#EFF3F6] text-[#657C91] border-[#C2D1DD]';
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('FAILED')) {
      return 'bg-[#FBF0F0] text-[#B44747] border-[#ECC0C0]';
    }
    return 'bg-[#FAF7F0] text-[#A87928] border-[#E8DEC8]';
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full border-[#D8C9A8] bg-white shadow-none">
      <CardHeader className="p-0 pb-3 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#B8A16A]" />
            Recent System Activity
          </CardTitle>
          <CardDescription className="text-xs text-[#77736A] mt-0.5">
            Immutable audit log stream of institutional actions
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#B8A16A] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#B8A16A] animate-pulse" />
          Live Audit
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[360px] my-2 pr-1 custom-scrollbar">
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
                className="p-2.5 rounded bg-[#FBF9F3] border border-[#E8E0D0] hover:bg-[#F4F0E6] hover:border-[#D8C9A8] transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider shrink-0 ${getActionBadgeClass(
                      item.action
                    )}`}
                  >
                    {item.action}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[#202020] font-medium truncate">{item.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#77736A] mt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#77736A]" />
                        {item.username}
                      </span>
                      <span>·</span>
                      <span>{item.entityType}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-[10px] text-[#77736A] text-right font-mono">
                  {formatTime(item.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <div className="pt-3 border-t border-[#E8E0D0] text-[11px] text-[#77736A] flex items-center justify-between">
        <span>Audit Trail: Immutable SHA Log</span>
        <span>Showing latest {activities.length} records</span>
      </div>
    </Card>
  );
};
