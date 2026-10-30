import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState } from '../../ui';
import { FacultyRequisitionSummary } from '../../../types/faculty';
import { Send, Clock, Calendar, AlertCircle } from 'lucide-react';

interface FacultyRequisitionsCardProps {
  requisitions?: FacultyRequisitionSummary;
}

export const FacultyRequisitionsCard: React.FC<FacultyRequisitionsCardProps> = ({ requisitions }) => {
  const reqs = requisitions?.recentRequisitions || [];

  if (reqs.length === 0) {
    return (
      <Card className="h-full bg-white border-slate-200 shadow-xs flex flex-col">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-600" />
              Resource Requisitions
            </CardTitle>
            <Badge variant="neutral">0 Requests</Badge>
          </div>
          <CardDescription>
            Facility and equipment requisition tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="No faculty resource requests found."
            description="Submitted laboratory session or equipment requests will appear here with real-time approval status."
            icon={Send}
            compact
          />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="teal">APPROVED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">CANCELLED</Badge>;
      case 'COMPLETED':
        return <Badge variant="blue">COMPLETED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Card className="h-full bg-white border-slate-200 shadow-xs flex flex-col hover:border-slate-300 transition-all">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-600" />
              Resource Requisitions
            </CardTitle>
            <CardDescription>
              {requisitions?.pendingCount ?? 0} pending &bull; {requisitions?.approvedCount ?? 0} approved
            </CardDescription>
          </div>
          <Badge variant="warning">
            {requisitions?.pendingCount ?? 0} Pending
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2.5 overflow-y-auto max-h-[360px]">
        {reqs.map((r) => (
          <div
            key={r.id}
            className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-xs text-slate-900 block">
                  {r.resourceName}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1" title={r.purpose}>
                  {r.purpose}
                </p>
              </div>
              {getStatusBadge(r.status)}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {r.requestedDate}
              </span>
              <span className="flex items-center gap-1 font-mono text-slate-600">
                <Clock className="w-3 h-3 text-slate-400" />
                {r.startTime?.substring(0, 5)} - {r.endTime?.substring(0, 5)}
              </span>
              <span className="text-slate-600 uppercase font-bold text-[9px] px-1.5 py-0.5 rounded bg-slate-100">
                {r.priority}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
