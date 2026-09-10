import React from 'react';
import { PrincipalHostelOverviewDto } from '../../../types/principal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../../ui';
import { Building, Bed, BedDouble, AlertCircle } from 'lucide-react';

interface PrincipalHostelOverviewCardProps {
  hostel: PrincipalHostelOverviewDto;
}

export const PrincipalHostelOverviewCard: React.FC<PrincipalHostelOverviewCardProps> = ({ hostel }) => {
  const hasBeds = hostel.totalBeds > 0;
  const occupancyPercentage = hostel.occupancyRate !== null && hostel.occupancyRate !== undefined ? hostel.occupancyRate : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Hostel & Residential Operations</CardTitle>
          </div>
          {hostel.occupancyRate !== null && (
            <Badge variant="blue" size="md">
              Occupancy: {hostel.occupancyRate}%
            </Badge>
          )}
        </div>
        <CardDescription>
          Campus residential capacity, block occupancy, and bed lifecycle state.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!hasBeds ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No hostel occupancy data available.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stat Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Hostels</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{hostel.totalHostels}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Rooms</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{hostel.totalRooms}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Bed Capacity</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{hostel.totalBeds}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Occupancy Rate</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {hostel.occupancyRate !== null ? `${hostel.occupancyRate}%` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Occupancy Progress Bar */}
            {hostel.occupancyRate !== null && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Occupancy Progress</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {hostel.occupiedBeds} occupied / {hostel.occupiedBeds + hostel.availableBeds} usable beds
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, occupancyPercentage))}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-400 inline" />
                  <span>Formula: <em>(occupiedBeds / (occupiedBeds + availableBeds)) * 100</em></span>
                </div>
              </div>
            )}

            {/* Detailed Bed Status Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Bed className="w-3.5 h-3.5" />
                  <span>Available</span>
                </div>
                <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                  {hostel.availableBeds}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>Occupied</span>
                </div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-300 mt-1">
                  {hostel.occupiedBeds}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <Building className="w-3.5 h-3.5" />
                  <span>Maintenance</span>
                </div>
                <div className="text-lg font-bold text-amber-800 dark:text-amber-300 mt-1">
                  {hostel.maintenanceBeds}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400">
                  <Bed className="w-3.5 h-3.5" />
                  <span>Reserved</span>
                </div>
                <div className="text-lg font-bold text-purple-800 dark:text-purple-300 mt-1">
                  {hostel.reservedBeds}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <Bed className="w-3.5 h-3.5" />
                  <span>Inactive</span>
                </div>
                <div className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1">
                  {hostel.inactiveBeds}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
