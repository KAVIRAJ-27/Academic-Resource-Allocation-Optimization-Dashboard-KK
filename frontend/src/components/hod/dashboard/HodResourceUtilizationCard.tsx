import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { HodResourceUtilizationSummary } from '../../../types/hod';
import {
  PieChart,
  CheckCircle,
  Activity,
  Wrench,
  Ban,
} from 'lucide-react';

interface HodResourceUtilizationCardProps {
  utilization: HodResourceUtilizationSummary;
}

export const HodResourceUtilizationCard: React.FC<HodResourceUtilizationCardProps> = ({
  utilization,
}) => {
  const {
    totalResources = 0,
    availableCount = 0,
    allocatedCount = 0,
    maintenanceCount = 0,
    inactiveCount = 0,
    utilizationRate = 0,
  } = utilization || {};

  return (
    <Card className="p-6 border border-[#D8C9A8] bg-white shadow-none rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FBF9F3] text-[#B8A16A] border border-[#E8E0D0]">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#202020]">Resource Utilization Overview</h3>
              <p className="text-xs text-[#77736A]">Department equipment, rooms & laboratories status</p>
            </div>
          </div>
          <Badge variant="neutral" size="md">
            {totalResources} Total Resources
          </Badge>
        </div>

        {/* Utilization Rate Progress Bar */}
        <div className="p-4 rounded bg-[#FBF9F3] border border-[#E8E0D0] mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#555555] font-medium">Department Utilization Index</span>
            <span className="text-[#202020] font-serif font-bold text-sm">{utilizationRate}%</span>
          </div>
          <div className="w-full bg-[#E8E0D0] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#B8A16A] h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-[#77736A] mt-2">
            Ratio of currently allocated department resources relative to active pool.
          </p>
        </div>

        {/* Breakdown Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-[#F0F5F2] border border-[#B6D1C1] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#3F7655] mb-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Available</span>
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-xl font-serif font-bold text-[#202020] mt-1">{availableCount}</div>
            <span className="text-[10px] text-[#3F7655] font-medium">Ready for booking</span>
          </div>

          <div className="p-3 rounded bg-[#F4F0E6] border border-[#D8C9A8] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#B8A16A] mb-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Allocated</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-xl font-serif font-bold text-[#202020] mt-1">{allocatedCount}</div>
            <span className="text-[10px] text-[#B8A16A] font-medium">In active use</span>
          </div>

          <div className="p-3 rounded bg-[#FAF7F0] border border-[#E8DEC8] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#A87928] mb-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Maintenance</span>
              <Wrench className="w-4 h-4" />
            </div>
            <div className="text-xl font-serif font-bold text-[#202020] mt-1">{maintenanceCount}</div>
            <span className="text-[10px] text-[#A87928] font-medium">Under inspection</span>
          </div>

          <div className="p-3 rounded bg-[#FBF9F3] border border-[#E8E0D0] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#77736A] mb-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Inactive</span>
              <Ban className="w-4 h-4" />
            </div>
            <div className="text-xl font-serif font-bold text-[#202020] mt-1">{inactiveCount}</div>
            <span className="text-[10px] text-[#77736A]">Offline / Deactivated</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
