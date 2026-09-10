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
    <Card className="p-6 border border-gray-800 bg-gray-900/40 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Resource Utilization Overview</h3>
              <p className="text-xs text-gray-400">Department equipment, rooms & laboratories status</p>
            </div>
          </div>
          <Badge variant="blue" size="md">
            {totalResources} Total Resources
          </Badge>
        </div>

        {/* Utilization Rate Progress Bar */}
        <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/80 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-400 font-medium">Department Utilization Index</span>
            <span className="text-white font-bold text-sm">{utilizationRate}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-purple-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Ratio of currently allocated department resources relative to active pool.
          </p>
        </div>

        {/* Breakdown Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-teal-400 mb-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Available</span>
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{availableCount}</div>
            <span className="text-[10px] text-teal-300/70">Ready for booking</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-400 mb-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Allocated</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{allocatedCount}</div>
            <span className="text-[10px] text-purple-300/70">In active use</span>
          </div>

          <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-orange-400 mb-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Maintenance</span>
              <Wrench className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{maintenanceCount}</div>
            <span className="text-[10px] text-orange-300/70">Under inspection</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Inactive</span>
              <Ban className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{inactiveCount}</div>
            <span className="text-[10px] text-gray-400">Offline / Deactivated</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
