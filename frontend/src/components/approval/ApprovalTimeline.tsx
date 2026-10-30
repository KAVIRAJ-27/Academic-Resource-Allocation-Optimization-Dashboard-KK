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
        <div className="flex items-center gap-3 text-[#77736A]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#B8A16A] border-t-transparent" />
          <span>Loading lifecycle history...</span>
        </div>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Clock className="mb-2 h-8 w-8 text-[#77736A]" />
        <p className="text-sm text-[#77736A]">No milestone events recorded yet.</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string, _status: string) => {
    switch (eventType) {
      case 'REQUEST_CREATED':
        return <Calendar className="h-4 w-4 text-[#B8A16A]" />;
      case 'SUBMITTED_FOR_APPROVAL':
        return <Clock className="h-4 w-4 text-[#A87928]" />;
      case 'UNDER_REVIEW':
        return <UserCheck className="h-4 w-4 text-[#657C91]" />;
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-[#3F7655]" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-[#B44747]" />;
      case 'ALLOCATED':
        return <Layers className="h-4 w-4 text-[#3F7655]" />;
      default:
        return <AlertCircle className="h-4 w-4 text-[#77736A]" />;
    }
  };

  const getBorderColor = (eventType: string) => {
    switch (eventType) {
      case 'APPROVED':
      case 'ALLOCATED':
        return 'border-[#C2D6C9] bg-[#F0F5F2] text-[#3F7655]';
      case 'REJECTED':
      case 'CANCELLED':
        return 'border-[#EBBABA] bg-[#FBF0F0] text-[#B44747]';
      case 'SUBMITTED_FOR_APPROVAL':
        return 'border-[#E8D8BA] bg-[#FAF7F0] text-[#A87928]';
      default:
        return 'border-[#D8C9A8] bg-[#F8F6F0] text-[#555555]';
    }
  };

  return (
    <div className="relative pl-6">
      {/* Vertical Track Line */}
      <div className="absolute bottom-4 left-[15px] top-4 w-0.5 bg-[#E8E0D0]" />

      <div className="space-y-6">
        {timeline.map((item, idx) => {
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
                )} shadow-none`}
              >
                {getEventIcon(item.eventType, item.status)}
              </div>

              {/* Event Content Card */}
              <div className="flex-1 rounded-xl border border-[#D8C9A8] bg-white p-4 shadow-none transition-all hover:border-[#B8A16A]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-serif font-bold text-[#202020]">
                    {item.eventType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-[#77736A] font-medium">{formattedDate}</span>
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs text-[#555555]">
                  <span className="text-[#202020] font-semibold">{item.actorName}</span>
                  {item.actorRole && (
                    <span className="rounded bg-[#F8F6F0] border border-[#E8E0D0] px-1.5 py-0.5 text-[10px] font-medium text-[#555555]">
                      {item.actorRole}
                    </span>
                  )}
                </div>

                {item.comment && (
                  <p className="mt-2 rounded-lg bg-[#FBF9F3] border border-[#E8E0D0] p-2 text-xs italic text-[#555555]">
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
