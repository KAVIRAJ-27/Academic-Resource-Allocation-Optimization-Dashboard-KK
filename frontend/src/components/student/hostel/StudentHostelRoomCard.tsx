import React from 'react';
import { Card } from '../../ui';
import { StudentHostelRoom, StudentHostelBed, StudentHostelFloor, StudentHostelBlock } from '../../../types/studentHostel';
import { DoorOpen, BedDouble, Users, ShieldCheck, CheckCircle2, Info } from 'lucide-react';

interface Props {
  room?: StudentHostelRoom;
  bed?: StudentHostelBed;
  floor?: StudentHostelFloor;
  block?: StudentHostelBlock;
}

export const StudentHostelRoomCard: React.FC<Props> = ({ room, bed, floor, block }) => {
  if (!room && !bed) return null;

  const capacity = room?.capacity || 1;
  const occupancy = room?.currentOccupancy ?? 1;
  const occupancyPercent = Math.min(100, Math.round((occupancy / capacity) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Room Specifications */}
      <Card className="p-5 bg-[#11141C] border-[#1E2330] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <DoorOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Room Specifications
              </h3>
              <p className="text-[11px] text-gray-400">
                Designated residential dwelling unit
              </p>
            </div>
          </div>
          {room?.status && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171A23] text-teal-400 border border-[#222838]">
              {room.status}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 bg-[#171A23] border border-[#222838] rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Room Number</span>
            <div className="text-base font-bold text-white font-mono">{room?.roomNumber || '—'}</div>
          </div>

          <div className="p-3 bg-[#171A23] border border-[#222838] rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Room Category</span>
            <div className="text-sm font-semibold text-purple-300">{room?.roomType || 'Standard'}</div>
          </div>
        </div>

        {/* Capacity & Occupancy Bar */}
        <div className="p-3.5 bg-[#171A23] border border-[#222838] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              Room Occupancy
            </span>
            <span className="font-mono text-xs text-white">
              <strong className="text-teal-400">{occupancy}</strong> / {capacity} Beds Occupied
            </span>
          </div>

          <div className="w-full bg-[#11141C] h-2 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* 2. Assigned Bed Details */}
      <Card className="p-5 bg-[#11141C] border-[#1E2330] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <BedDouble className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Assigned Bedspace
              </h3>
              <p className="text-[11px] text-gray-400">
                Personal sleeping space & inventory registration
              </p>
            </div>
          </div>
          {bed?.status && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {bed.status}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 bg-[#171A23] border border-[#222838] rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Bed Identifier</span>
            <div className="text-base font-bold text-teal-300 font-mono">{bed?.bedNumber || '—'}</div>
          </div>

          <div className="p-3 bg-[#171A23] border border-[#222838] rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Location Mapping</span>
            <div className="text-xs font-semibold text-white truncate">
              {block?.name || 'Block'}, {floor?.name || `Floor ${floor?.floorNumber ?? ''}`}
            </div>
          </div>
        </div>

        <div className="p-3 bg-teal-500/5 border border-teal-500/15 rounded-xl flex items-start gap-2.5 text-xs text-teal-300/90">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Your bedspace is registered under your student enrollment. Unauthorized swaps or furniture movement are prohibited by hostel bylaws.
          </p>
        </div>
      </Card>
    </div>
  );
};
