import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodActiveAllocationItem } from '../../../types/hod';
import {
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HodActiveAllocationsCardProps {
  allocations: HodActiveAllocationItem[];
}

export const HodActiveAllocationsCard: React.FC<HodActiveAllocationsCardProps> = ({
  allocations,
}) => {
  const navigate = useNavigate();

  const formatDatetime = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Card className="p-6 border border-[#D8C9A8] bg-white shadow-none rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FBF9F3] text-[#3F7655] border border-[#E8E0D0]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#202020]">Active Resource Allocations</h3>
              <p className="text-xs text-[#77736A]">Department laboratory, room & equipment bookings</p>
            </div>
          </div>
          <Badge variant="success" size="md">
            {allocations.length} Active
          </Badge>
        </div>

        {allocations.length === 0 ? (
          <div className="py-10 text-center text-[#77736A] text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#77736A] opacity-60" />
            <p className="font-serif font-bold text-[#202020]">No Active Allocations</p>
            <p className="text-[#77736A] mt-0.5">
              There are currently no active resource bookings in this department.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allocations.map((alloc) => (
              <div
                key={alloc.allocationId}
                className="p-3.5 rounded bg-[#FBF9F3] border border-[#E8E0D0] hover:bg-[#F4F0E6] hover:border-[#D8C9A8] transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#202020]">{alloc.resourceName}</span>
                      <span className="text-[10px] font-mono text-[#77736A] bg-white border border-[#D9D2C3] px-1.5 py-0.5 rounded">
                        {alloc.resourceCode}
                      </span>
                    </div>
                    <p className="text-[#555555] mt-1 line-clamp-1">{alloc.purpose}</p>
                  </div>
                  <Badge variant="success">ACTIVE</Badge>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#E8E0D0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#77736A]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[#202020] font-medium">
                      <UserCheck className="w-3 h-3 text-[#3F7655]" />
                      {alloc.allocatedToName}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#B8A16A] bg-white px-1.5 py-0.2 rounded border border-[#D8C9A8]">
                      {alloc.allocatedToRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#77736A] font-mono">
                    <Calendar className="w-3 h-3 text-[#B8A16A]" />
                    <span>{formatDatetime(alloc.startDatetime)}</span>
                    <span>-</span>
                    <span>{formatDatetime(alloc.endDatetime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E8E0D0] flex items-center justify-between text-xs text-[#77736A]">
        <span>Department facilities currently engaged</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/hod/allocations')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-[#3F7655] hover:text-[#202020] p-0 font-medium"
        >
          View All Allocations
        </Button>
      </div>
    </Card>
  );
};
