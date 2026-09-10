import React from 'react';
import { Card } from '../../ui';
import { Badge } from '../../ui';
import { StudentHostelResponse } from '../../../types/studentHostel';
import {
  Hotel,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Building,
  BedDouble,
  DoorOpen,
} from 'lucide-react';

interface Props {
  data: StudentHostelResponse;
}

export const StudentHostelStatusCard: React.FC<Props> = ({ data }) => {
  const isAllocated = data.allocated && data.currentAllocation;
  const alloc = data.currentAllocation;
  const hostel = data.hostel;
  const room = data.room;
  const bed = data.bed;

  return (
    <Card className="p-6 bg-[#11141C] border-[#1E2330] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left identity & status */}
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl border ${
            isAllocated
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <Hotel className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isAllocated ? (hostel?.name || 'Assigned Hostel') : 'No Active Hostel Allocation'}
              </h2>
              {isAllocated ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ALLOCATED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-300 border border-gray-500/30">
                  NOT ALLOCATED
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400">
              {isAllocated
                ? (hostel?.address || 'Campus Residential Quarter')
                : 'You are currently not assigned to an institutional hostel block.'}
            </p>

            {isAllocated && hostel?.code && (
              <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400 font-mono">
                <span>Code: <strong className="text-white">{hostel.code}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-teal-400">{hostel.type}</strong></span>
                {alloc?.academicYearName && (
                  <>
                    <span>•</span>
                    <span>Term: <strong className="text-gray-300">{alloc.academicYearName}</strong></span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right quick stats */}
        {isAllocated ? (
          <div className="flex flex-wrap items-center gap-3">
            {room && (
              <div className="p-3 bg-[#171A23] border border-[#222838] rounded-xl text-center min-w-[90px]">
                <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mb-0.5">
                  <DoorOpen className="w-3 h-3 text-teal-400" />
                  <span>Room</span>
                </div>
                <span className="text-base font-bold text-white font-mono">{room.roomNumber}</span>
              </div>
            )}

            {bed && (
              <div className="p-3 bg-[#171A23] border border-[#222838] rounded-xl text-center min-w-[90px]">
                <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mb-0.5">
                  <BedDouble className="w-3 h-3 text-teal-400" />
                  <span>Bed</span>
                </div>
                <span className="text-base font-bold text-teal-300 font-mono">{bed.bedNumber}</span>
              </div>
            )}

            {alloc?.startDate && (
              <div className="p-3 bg-[#171A23] border border-[#222838] rounded-xl text-left min-w-[140px]">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-0.5">
                  <Calendar className="w-3 h-3 text-teal-400" />
                  <span>Tenure</span>
                </div>
                <span className="text-xs font-semibold text-white font-mono">
                  {alloc.startDate}
                </span>
                <p className="text-[10px] text-gray-500 font-mono">
                  To: {alloc.endDate || 'Ongoing'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-[#171A23] border border-[#222838] rounded-xl text-xs text-gray-400 max-w-sm">
            Hostel accommodation is governed by university residency policies. Enrolled students are mapped by residential wardens.
          </div>
        )}
      </div>
    </Card>
  );
};
