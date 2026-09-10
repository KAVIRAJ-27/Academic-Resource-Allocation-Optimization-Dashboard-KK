import React from 'react';
import { Card } from '../../ui';
import { StudentHostelResponse } from '../../../types/studentHostel';
import {
  Hotel,
  Building,
  Layers,
  DoorOpen,
  BedDouble,
  ChevronRight,
} from 'lucide-react';

interface Props {
  data: StudentHostelResponse;
}

export const StudentHostelHierarchyCard: React.FC<Props> = ({ data }) => {
  const steps = [
    {
      level: 'Hostel',
      name: data.hostel?.name || 'Assigned Hostel',
      detail: data.hostel?.code ? `Code: ${data.hostel.code}` : undefined,
      icon: Hotel,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
    },
    {
      level: 'Block',
      name: data.block?.name || 'Block',
      detail: data.block?.code ? `Code: ${data.block.code}` : undefined,
      icon: Building,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      level: 'Floor',
      name: data.floor?.name || `Floor ${data.floor?.floorNumber ?? ''}`,
      detail: data.floor?.floorNumber !== undefined ? `Level ${data.floor.floorNumber}` : undefined,
      icon: Layers,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      level: 'Room',
      name: `Room ${data.room?.roomNumber || ''}`,
      detail: data.room?.roomType ? `${data.room.roomType}` : undefined,
      icon: DoorOpen,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      level: 'Bed',
      name: `Bed ${data.bed?.bedNumber || ''}`,
      detail: data.bed?.status || 'OCCUPIED',
      icon: BedDouble,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <Card className="p-5 bg-[#11141C] border-[#1E2330] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Residential Allocation Hierarchy
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Verified structural lineage connecting hostel campus to your designated bedspace
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.level}
              className="relative p-3.5 bg-[#171A23] border border-[#222838] rounded-xl flex flex-col justify-between space-y-2 hover:border-[#2E364A] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400">
                  {step.level}
                </span>
                <div className={`p-1.5 rounded-lg border ${step.bgColor}`}>
                  <Icon className={`w-3.5 h-3.5 ${step.color}`} />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white truncate" title={step.name}>
                  {step.name}
                </h4>
                {step.detail && (
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
