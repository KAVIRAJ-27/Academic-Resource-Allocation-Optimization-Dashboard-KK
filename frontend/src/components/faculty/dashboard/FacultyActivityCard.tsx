import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState } from '../../ui';
import { FacultyActivity } from '../../../types/faculty';
import { ShieldCheck, UserCheck, Send, Key, Activity, Clock } from 'lucide-react';

interface FacultyActivityCardProps {
  activities?: FacultyActivity[];
}

export const FacultyActivityCard: React.FC<FacultyActivityCardProps> = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card className="h-full bg-[#11141C] border-[#1E2330] flex flex-col">
        <CardHeader className="border-b border-[#1E2330] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Recent Faculty Activity
            </CardTitle>
            <Badge variant="neutral">0 Events</Badge>
          </div>
          <CardDescription>
            System verification and audit history
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="No recent activity."
            description="Audit events such as profile updates, logins, and requisitions will be logged here."
            icon={Activity}
            compact
          />
        </CardContent>
      </Card>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'FACULTY_PROFILE_UPDATED':
        return <UserCheck className="w-3.5 h-3.5 text-teal-400" />;
      case 'USER_LOGIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />;
      case 'ACADEMIC_RESOURCE_REQUEST_CREATED':
        return <Send className="w-3.5 h-3.5 text-orange-400" />;
      case 'PASSWORD_CHANGED':
        return <Key className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Card className="h-full bg-[#11141C] border-[#1E2330] flex flex-col shadow-card hover:border-[#2A3245] transition-all">
      <CardHeader className="border-b border-[#1E2330] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Recent Security & Action Log
            </CardTitle>
            <CardDescription>
              Verified telemetry for authenticated account
            </CardDescription>
          </div>
          <Badge variant="teal">{activities.length} Events</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 overflow-y-auto max-h-[360px]">
        {activities.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 p-3 bg-[#0E1017] border border-[#1E2330] rounded-xl hover:border-[#2A3245] transition-all"
          >
            <div className="p-2 rounded-lg bg-[#171A23] border border-[#262C3D] shrink-0 mt-0.5">
              {getActionIcon(a.action)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-200">
                {a.description}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                <span className="font-mono text-gray-400">{a.action}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {formatDate(a.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
