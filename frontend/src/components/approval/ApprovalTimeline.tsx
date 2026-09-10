import React from 'react';
import { AllocationTimelineItemDto } from '../../types/approval';
import { CheckCircle2, Clock, XCircle, AlertCircle, Calendar, UserCheck, Layers } from 'lucide-react';

interface ApprovalTimelineProps {
  timeline: AllocationTimelineItemDto[];
  isLoading?: boolean;
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ timeline, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span>Loading lifecycle history...</span>
        </div>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Clock className="mb-2 h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-400">No milestone events recorded yet.</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string, status: string) => {
    switch (eventType) {
      case 'REQUEST_CREATED':
        return <Calendar className="h-4 w-4 text-indigo-400" />;
      case 'SUBMITTED_FOR_APPROVAL':
        return <Clock className="h-4 w-4 text-amber-400" />;
      case 'UNDER_REVIEW':
        return <UserCheck className="h-4 w-4 text-blue-400" />;
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-rose-400" />;
      case 'ALLOCATED':
        return <Layers className="h-4 w-4 text-cyan-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getBorderColor = (eventType: string) => {
    switch (eventType) {
      case 'APPROVED':
        return 'border-emerald-500/50 bg-emerald-500/10';
      case 'REJECTED':
      case 'CANCELLED':
        return 'border-rose-500/50 bg-rose-500/10';
      case 'ALLOCATED':
        return 'border-cyan-500/50 bg-cyan-500/10';
      case 'SUBMITTED_FOR_APPROVAL':
        return 'border-amber-500/50 bg-amber-500/10';
      default:
        return 'border-slate-700 bg-slate-800/80';
    }
  };

  return (
    <div className="relative pl-6">
      {/* Vertical Track Line */}
      <div className="absolute bottom-4 left-[15px] top-4 w-0.5 bg-slate-800" />

      <div className="space-y-6">
        {timeline.map((item, idx) => {
          const isLast = idx === timeline.length - 1;
          const formattedDate = item.timestamp
            ? new Date(item.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            : 'Date unavailable';

          return (
            <div key={idx} className="relative flex items-start gap-4">
              {/* Bullet Icon */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${getBorderColor(
                  item.eventType
                )} shadow-md`}
              >
                {getEventIcon(item.eventType, item.status)}
              </div>

              {/* Event Content Card */}
              <div className="flex-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-sm transition-all hover:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-200">
                    {item.eventType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">{formattedDate}</span>
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">{item.actorName}</span>
                  {item.actorRole && (
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                      {item.actorRole}
                    </span>
                  )}
                </div>

                {item.comment && (
                  <p className="mt-2 rounded-lg bg-slate-950/50 p-2 text-xs italic text-slate-300">
                    "{item.comment}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
