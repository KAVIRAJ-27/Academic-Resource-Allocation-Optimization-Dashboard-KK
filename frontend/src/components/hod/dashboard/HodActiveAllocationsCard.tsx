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
    <Card className="p-6 border border-gray-800 bg-gray-900/40 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Active Resource Allocations</h3>
              <p className="text-xs text-gray-400">Department laboratory, room & equipment bookings</p>
            </div>
          </div>
          <Badge variant="teal" size="md">
            {allocations.length} Active
          </Badge>
        </div>

        {allocations.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-600 opacity-60" />
            <p className="font-medium text-gray-300">No Active Allocations</p>
            <p className="text-gray-500 mt-0.5">
              There are currently no active resource bookings in this department.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allocations.map((alloc) => (
              <div
                key={alloc.allocationId}
                className="p-3 rounded-xl bg-gray-800/40 border border-gray-800/80 hover:border-gray-700/80 transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{alloc.resourceName}</span>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                        {alloc.resourceCode}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1 line-clamp-1">{alloc.purpose}</p>
                  </div>
                  <Badge variant="teal">ACTIVE</Badge>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-gray-300 font-medium">
                      <UserCheck className="w-3 h-3 text-teal-400" />
                      {alloc.allocatedToName}
                    </span>
                    <span className="text-[10px] uppercase text-purple-300 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                      {alloc.allocatedToRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 font-mono">
                    <Calendar className="w-3 h-3 text-purple-400" />
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

      <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
        <span>Department facilities currently engaged</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/hod/allocations')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-teal-400 hover:text-teal-300 p-0"
        >
          View All Allocations
        </Button>
      </div>
    </Card>
  );
};
