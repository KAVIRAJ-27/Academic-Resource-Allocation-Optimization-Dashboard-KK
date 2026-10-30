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
  Available: '#3F7655',   // Sage Green
  Allocated: '#B8A16A',   // Champagne Gold
  Maintenance: '#A87928', // Amber Gold
  Inactive: '#77736A',    // Stone Gray
};

export const AcademicUtilizationChart: React.FC<AcademicUtilizationChartProps> = ({
  overview,
  loading,
}) => {
  if (loading || !overview) {
    return (
      <Card className="p-5 h-[340px] flex flex-col justify-between bg-white border border-[#D8C9A8] shadow-card">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[#F4F0E6] rounded w-1/3"></div>
          <div className="h-3 bg-[#F8F6F0] rounded w-1/2"></div>
          <div className="h-48 bg-[#F4F0E6] rounded-xl mt-4"></div>
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
    <Card className="p-5 flex flex-col justify-between min-h-[360px] bg-white border border-[#D8C9A8] shadow-card">
      <CardHeader className="p-0 pb-3 flex-row items-center justify-between border-b border-[#E8E0D0]">
        <div>
          <CardTitle className="text-sm font-serif font-bold text-[#202020] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#B8A16A]" />
            Academic Resource Utilization
          </CardTitle>
          <CardDescription className="text-xs text-[#555555] mt-0.5">
            Real-time status distribution across classrooms and laboratories
          </CardDescription>
        </div>
        {hasData && (
          <div className="text-right">
            <span className="text-xs font-mono text-[#B8A16A] font-bold">
              {overview.utilizationRate}%
            </span>
            <p className="text-[10px] text-[#77736A] font-mono">Utilization Rate</p>
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
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D8C9A8',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 10px -1px rgba(184, 161, 106, 0.15)',
                    }}
                    itemStyle={{ color: '#202020' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold font-serif text-[#202020]">
                  {overview.totalResources}
                </span>
                <span className="text-[9px] text-[#77736A] uppercase tracking-wider font-mono">
                  Total
                </span>
              </div>
            </div>

            {/* Status Legend with real numbers */}
            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8F6F0] border border-[#E8E0D0]">
                <span className="flex items-center gap-2 text-[#555555] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3F7655]" />
                  Available
                </span>
                <span className="font-mono text-[#3F7655] font-bold">{overview.available}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8F6F0] border border-[#E8E0D0]">
                <span className="flex items-center gap-2 text-[#555555] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8A16A]" />
                  Allocated
                </span>
                <span className="font-mono text-[#202020] font-bold">{overview.allocated}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8F6F0] border border-[#E8E0D0]">
                <span className="flex items-center gap-2 text-[#555555] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A87928]" />
                  Maintenance
                </span>
                <span className="font-mono text-[#A87928] font-bold">{overview.maintenance}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8F6F0] border border-[#E8E0D0]">
                <span className="flex items-center gap-2 text-[#555555] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#77736A]" />
                  Inactive
                </span>
                <span className="font-mono text-[#77736A] font-bold">{overview.inactive}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <div className="pt-3 border-t border-[#E8E0D0] text-[10px] text-[#77736A] font-mono flex items-center justify-between">
        <span>Resource Status: ResourceStatus ENUM</span>
        <span>Allocated: {overview.allocated} / {overview.available + overview.allocated} active</span>
      </div>
    </Card>
  );
};
