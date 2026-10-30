import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { BarChart3, AlertCircle } from 'lucide-react';

interface HodWorkloadDistributionChartProps {
  balancedCount?: number;
  overloadCount?: number;
  underloadCount?: number;
  pendingCalculationCount?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  BALANCED: { label: 'Balanced (Optimal)', color: '#14B8A6' },
  OVERLOAD: { label: 'Overloaded (>16 hrs)', color: '#F59E0B' },
  UNDERLOAD: { label: 'Underloaded (<10 hrs)', color: '#3B82F6' },
  PENDING_CALCULATION: { label: 'Pending Calculation', color: '#6B7280' },
};

export const HodWorkloadDistributionChart: React.FC<HodWorkloadDistributionChartProps> = ({
  balancedCount = 0,
  overloadCount = 0,
  underloadCount = 0,
  pendingCalculationCount = 0,
}) => {
  const totalEvaluated = balancedCount + overloadCount + underloadCount + pendingCalculationCount;

  if (totalEvaluated === 0) {
    return (
      <Card className="p-6 border border-gray-800 bg-gray-900/40 rounded-2xl flex flex-col items-center justify-center text-center min-h-[260px]">
        <AlertCircle className="w-8 h-8 text-gray-600 mb-2" />
        <p className="text-sm font-medium text-gray-300">No workload data available.</p>
        <p className="text-xs text-gray-500 mt-0.5">Faculty workload metrics have not been recorded yet.</p>
      </Card>
    );
  }

  const chartData = [
    {
      key: 'BALANCED',
      label: 'Balanced',
      count: balancedCount,
      fill: STATUS_CONFIG['BALANCED'].color,
    },
    {
      key: 'OVERLOAD',
      label: 'Overloaded',
      count: overloadCount,
      fill: STATUS_CONFIG['OVERLOAD'].color,
    },
    {
      key: 'UNDERLOAD',
      label: 'Underloaded',
      count: underloadCount,
      fill: STATUS_CONFIG['UNDERLOAD'].color,
    },
    {
      key: 'PENDING_CALCULATION',
      label: 'Pending',
      count: pendingCalculationCount,
      fill: STATUS_CONFIG['PENDING_CALCULATION'].color,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalEvaluated > 0 ? Math.round((item.count / totalEvaluated) * 100) : 0;
      return (
        <div className="bg-[#1A1E29] border border-[#2A3040] p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-semibold text-white">{item.label} Workload</p>
          <p className="text-gray-300">
            Faculty: <span className="font-bold text-white">{item.count}</span> ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border border-gray-800 bg-gray-900/40 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Workload Distribution</h3>
              <p className="text-xs text-gray-400">Department faculty workload equilibrium status</p>
            </div>
          </div>
          <Badge variant="teal" size="md">
            {totalEvaluated} Faculty Evaluated
          </Badge>
        </div>

        {/* Recharts Bar Visualization */}
        <div className="h-44 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Summary Pills */}
      <div className="mt-4 pt-3 border-t border-gray-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {chartData.map((item) => (
          <div
            key={item.key}
            className="p-2 rounded-lg bg-gray-800/40 border border-gray-800/60 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
              <span className="text-gray-300 font-medium truncate">{item.label}</span>
            </div>
            <span className="font-bold text-white pl-1">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
