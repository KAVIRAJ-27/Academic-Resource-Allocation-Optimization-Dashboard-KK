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
  Occupied: '#B8A16A',    // Classical Gold
  Available: '#3F7655',   // Classical Sage Green
  Reserved: '#657C91',    // Classical Slate Blue
  Maintenance: '#A87928', // Classical Amber
  Inactive: '#77736A',    // Classical Muted Charcoal
};

export const HostelOccupancyChart: React.FC<HostelOccupancyChartProps> = ({
  overview,
  loading,
}) => {
  if (loading || !overview) {
    return (
      <Card className="p-5 h-[340px] flex flex-col justify-between border-[#E8E0D0] bg-white">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[#F4F0E6] rounded w-1/3"></div>
          <div className="h-3 bg-[#F8F6F0] rounded w-1/2"></div>
          <div className="h-48 bg-[#FBF9F3] rounded-xl mt-4"></div>
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
    <Card className="p-5 flex flex-col justify-between min-h-[360px] border-[#D8C9A8] bg-white shadow-none">
      <CardHeader className="p-0 pb-3 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
            <Hotel className="w-4 h-4 text-[#B8A16A]" />
            Hostel Residential Occupancy
          </CardTitle>
          <CardDescription className="text-xs text-[#77736A] mt-0.5">
            Real-time bed distribution across residential blocks
          </CardDescription>
        </div>
        {hasData && (
          <div className="text-right">
            <span className="text-sm font-serif font-bold text-[#B8A16A]">
              {overview.occupancyRate}%
            </span>
            <p className="text-[10px] text-[#77736A] uppercase tracking-wider">Usable Occupancy</p>
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
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D8C9A8',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#202020',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                    itemStyle={{ color: '#202020' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-serif font-bold text-[#202020]">
                  {overview.totalBeds}
                </span>
                <span className="text-[9px] text-[#77736A] uppercase tracking-wider font-medium">
                  Total Beds
                </span>
              </div>
            </div>

            {/* Status Legend with real numbers */}
            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#FBF9F3] border border-[#E8E0D0]">
                <span className="flex items-center gap-2 text-[#202020] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8A16A]" />
                  Occupied
                </span>
                <span className="font-serif font-bold text-[#B8A16A]">{overview.occupiedBeds}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FBF9F3] border border-[#E8E0D0]">
                <span className="flex items-center gap-2 text-[#202020] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3F7655]" />
                  Available
                </span>
                <span className="font-serif font-bold text-[#3F7655]">{overview.availableBeds}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FBF9F3] border border-[#E8E0D0]">
                <span className="flex items-center gap-2 text-[#202020] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#657C91]" />
                  Reserved
                </span>
                <span className="font-serif font-bold text-[#657C91]">{overview.reservedBeds}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FBF9F3] border border-[#E8E0D0]">
                <span className="flex items-center gap-2 text-[#202020] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A87928]" />
                  Maintenance / Inactive
                </span>
                <span className="font-serif font-bold text-[#A87928]">
                  {overview.maintenanceBeds + overview.inactiveBeds}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <div className="pt-3 border-t border-[#E8E0D0] text-[11px] text-[#77736A] flex items-center justify-between">
        <span>Usable Capacity: {overview.usableBeds} beds</span>
        <span>Occupancy: {overview.occupiedBeds} / {overview.usableBeds} usable</span>
      </div>
    </Card>
  );
};
