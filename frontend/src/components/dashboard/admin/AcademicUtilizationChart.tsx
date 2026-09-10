import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, EmptyState } from '../../ui';
import { AcademicResourceOverview } from '../../../types/dashboard';

interface AcademicUtilizationChartProps {
  overview: AcademicResourceOverview | null;
  loading: boolean;
}

const STATUS_COLORS = {
  Available: '#10B981',   // Emerald
  Allocated: '#0D9488',   // Teal
  Maintenance: '#F59E0B', // Amber
  Inactive: '#6B7280',    // Gray
};

export const AcademicUtilizationChart: React.FC<AcademicUtilizationChartProps> = ({
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

  const hasData = overview.totalResources > 0;

  const chartData = [
    { name: 'Available', value: overview.available, color: STATUS_COLORS.Available },
    { name: 'Allocated', value: overview.allocated, color: STATUS_COLORS.Allocated },
    { name: 'Maintenance', value: overview.maintenance, color: STATUS_COLORS.Maintenance },
    { name: 'Inactive', value: overview.inactive, color: STATUS_COLORS.Inactive },
  ].filter((item) => item.value > 0);

  return (
    <Card className="p-5 flex flex-col justify-between min-h-[360px]">
      <CardHeader className="p-0 pb-3 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            Academic Resource Utilization
          </CardTitle>
          <CardDescription className="text-xs text-gray-400 mt-0.5">
            Real-time status distribution across classrooms and laboratories
          </CardDescription>
        </div>
        {hasData && (
          <div className="text-right">
            <span className="text-xs font-mono text-teal-400 font-bold">
              {overview.utilizationRate}%
            </span>
            <p className="text-[10px] text-gray-500 font-mono">Utilization Rate</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col items-center justify-center">
        {!hasData ? (
          <EmptyState
            title="No academic resource data available"
            description="The database currently contains no registered classrooms, laboratories, or academic equipment."
            icon={Layers}
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
                  {overview.totalResources}
                </span>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">
                  Total
                </span>
              </div>
            </div>

            {/* Status Legend with real numbers */}
            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#171A23]/60 border border-[#1E2330]">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Available
                </span>
                <span className="font-mono text-emerald-400 font-semibold">{overview.available}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#171A23]/60 border border-[#1E2330]">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  Allocated
                </span>
                <span className="font-mono text-teal-300 font-semibold">{overview.allocated}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#171A23]/60 border border-[#1E2330]">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Maintenance
                </span>
                <span className="font-mono text-amber-400 font-semibold">{overview.maintenance}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#171A23]/60 border border-[#1E2330]">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                  Inactive
                </span>
                <span className="font-mono text-gray-400 font-semibold">{overview.inactive}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <div className="pt-3 border-t border-[#1E2330] text-[10px] text-gray-500 font-mono flex items-center justify-between">
        <span>Resource Status: ResourceStatus ENUM</span>
        <span>Allocated: {overview.allocated} / {overview.available + overview.allocated} active</span>
      </div>
    </Card>
  );
};
