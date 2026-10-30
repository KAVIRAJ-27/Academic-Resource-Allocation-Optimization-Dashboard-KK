import React from 'react';
import {
  PrincipalPendingApprovalsDto,
  PrincipalRecentActivityDto,
} from '../../../types/principal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../../ui';
import { CheckSquare, Activity, Clock, User, ShieldCheck } from 'lucide-react';

interface PrincipalApprovalsActivityCardsProps {
  approvals: PrincipalPendingApprovalsDto;
  recentActivity: PrincipalRecentActivityDto[];
}

export const PrincipalApprovalsActivityCards: React.FC<PrincipalApprovalsActivityCardsProps> = ({
  approvals,
  recentActivity,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* 1. Pending Approvals (Read-Only Monitoring) */}
      <Card className="flex flex-col border-[#D8C9A8] bg-white shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#B8A16A]" />
              <CardTitle className="text-base font-serif font-bold text-[#202020]">Pending Institutional Approvals</CardTitle>
            </div>
            {approvals.pendingCount > 0 ? (
              <Badge variant="warning" size="sm">
                {approvals.pendingCount} Pending
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                0 Pending
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs text-[#77736A]">
            High-level oversight of resource & administrative items requiring approval (Read-Only monitoring in Phase 23).
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          {(!approvals.items || approvals.items.length === 0) ? (
            <div className="text-center py-10 text-[#77736A] text-sm">
              No pending approvals found.
            </div>
          ) : (
            <div className="divide-y divide-[#E8E0D0]">
              {approvals.items.map((app) => (
                <div key={app.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#202020]">
                          {app.entityType.replace(/_/g, ' ')}
                        </span>
                        {app.entityId && (
                          <span className="text-xs font-mono text-[#77736A]">#{app.entityId}</span>
                        )}
                        <Badge variant="warning" size="sm">
                          {app.approvalLevel || 'PRINCIPAL'}
                        </Badge>
                      </div>

                      <div className="text-xs text-[#555555] flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#77736A]" />
                        <span>Requested by: <strong className="text-[#202020]">{app.requesterName}</strong></span>
                        {app.requesterEmail && <span className="text-[#77736A]">({app.requesterEmail})</span>}
                      </div>

                      {app.comments && (
                        <p className="text-xs text-[#555555] italic bg-[#FBF9F3] border border-[#E8E0D0] p-2 rounded mt-1">
                          "{app.comments}"
                        </p>
                      )}
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <div className="text-[11px] text-[#77736A] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#77736A]" />
                        <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Recent Safe Activity (Audit Trail) */}
      <Card className="flex flex-col border-[#D8C9A8] bg-white shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#B8A16A]" />
              <CardTitle className="text-base font-serif font-bold text-[#202020]">Recent Institution Activity</CardTitle>
            </div>
            <Badge variant="neutral" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1 inline text-[#3F7655]" />
              Audit Log
            </Badge>
          </div>
          <CardDescription className="text-xs text-[#77736A]">
            Safe institution-scoped audit trail of system, academic, and resource transactions.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          {(!recentActivity || recentActivity.length === 0) ? (
            <div className="text-center py-10 text-[#77736A] text-sm">
              No recent institution activity.
            </div>
          ) : (
            <div className="divide-y divide-[#E8E0D0]">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#202020]">
                          {activity.action}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#FBF9F3] border border-[#E8E0D0] text-[#555555] font-mono">
                          {activity.entityType}
                        </span>
                      </div>

                      <div className="text-xs text-[#555555]">
                        <span>By: <strong className="text-[#202020]">{activity.userName}</strong></span>
                        {activity.userEmail && <span className="ml-1 text-[#77736A]">({activity.userEmail})</span>}
                      </div>

                      {activity.details && (
                        <div className="text-xs text-[#555555]">
                          {activity.details}
                        </div>
                      )}
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <div className="text-[11px] text-[#77736A] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#77736A]" />
                        <span>{activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'Recently'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
