import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Hotel } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, EmptyState } from '../../ui';
import { HostelResourceOverview } from '../../../types/dashboard';

interface HostelOccupancyChartProps {
  overview: HostelResourceOverview | null;
  loading: boolean;
}

const BED_COLORS = {
  Occupied: '#F97316',    // Orange
  Available: '#14B8A6',   // Teal
  Reserved: '#8B5CF6',    // Purple
  Maintenance: '#F59E0B', // Amber
  Inactive: '#4B5563',    // Dark Gray
};

export const HostelOccupancyChart: React.FC<HostelOccupancyChartProps> = ({
  overview,
  loading,
}) => {
  if (loading || !overview) {
    return (
      <Card className="p-5 h-[340px] flex flex-col justify-between">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[#1E2330] rounded w-1/3"></div>
          <div className="h-3 bg-[#1E2330] rounded w-1/2"></div>
          <div className="h-48 bg-[#1E2330]/40 rounded-xl mt-4"></div>
        </div>
      </Card>
    );
  }

  const hasData = overview.totalBeds > 0;

  const chartData = [
    { name: 'Occupied', value: overview.occupiedBeds, color: BED_COLORS.Occupied },
    { name: 'Available', value: overview.availableBeds, color: BED_COLORS.Available },
    { name: 'Reserved', value: overview.reservedBeds, color: BED_COLORS.Reserved },
    { name: 'Maintenance', value: overview.maintenanceBeds, color: BED_COLORS.Maintenance },
    { name: 'Inactive', value: overview.inactiveBeds, color: BED_COLORS.Inactive },
  ].filter((item) => item.value > 0);

  return (
    <Card className="p-5 flex flex-col justify-between min-h-[360px]">
      <CardHeader className="p-0 pb-3 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Hotel className="w-4 h-4 text-orange-400" />
            Hostel Residential Occupancy
          </CardTitle>
          <CardDescription className="text-xs text-gray-400 mt-0.5">
            Real-time bed distribution across residential blocks
          </CardDescription>
        </div>
        {hasData && (
          <div className="text-right">
            <span className="text-xs font-mono text-orange-400 font-bold">
              {overview.occupancyRate}%
            </span>
            <p className="text-[10px] text-gray-500 font-mono">Usable Occupancy</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col items-center justify-center">
        {!hasData ? (
          <EmptyState
            title="No hostel occupancy data available"
            description="The database currently contains no registered residential hostels, rooms, or beds."
            icon={Hotel}
            compact
          />
        ) : (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 h-[180px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#11141C',
                      borderColor: '#1E2330',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold font-mono text-white">
                  {overview.totalBeds}
                </span>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">
                  Total Beds
                </span>
              </div>
            </div>

            {/* Status Legend with real numbers */}
            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#171A23]/60 border border-[#1E2330]">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Occupied
                </span>
                <span className="font-mono text-orange-400 font-semibold">{overview.occupiedBeds}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#171A23]/60 border border-[#1E2330]">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  Available
                </span>
                <span className="font-mono text-teal-300 font-semibold">{overview.availableBeds}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#171A23]/60 border border-[#1E2330]">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Reserved
                </span>
                <span className="font-mono text-purple-400 font-semibold">{overview.reservedBeds}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#171A23]/60 border border-[#1E2330]">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Maintenance / Inactive
                </span>
                <span className="font-mono text-amber-400 font-semibold">
                  {overview.maintenanceBeds + overview.inactiveBeds}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <div className="pt-3 border-t border-[#1E2330] text-[10px] text-gray-500 font-mono flex items-center justify-between">
        <span>Usable Capacity: {overview.usableBeds} beds</span>
        <span>Occupancy: {overview.occupiedBeds} / {overview.usableBeds} usable</span>
      </div>
    </Card>
  );
};
