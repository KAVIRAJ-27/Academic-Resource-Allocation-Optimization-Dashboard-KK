import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface WorkloadChartProps {
  statusDistribution?: Record<string, number>;
  title?: string;
}

const WORKLOAD_COLORS: Record<string, string> = {
  NORMAL: '#10B981',
  BALANCED: '#10B981',
  LOW: '#64748B',
  UNDERUTILIZED: '#64748B',
  HIGH: '#F59E0B',
  OVERLOADED: '#EF4444',
};

export const WorkloadChart: React.FC<WorkloadChartProps> = ({
  statusDistribution = {},
  title = 'Faculty Workload Status Distribution',
}) => {
  const chartData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status,
    count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-center">
        <p className="text-xs text-slate-400">No faculty workload data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2330" vertical={false} />
            <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={WORKLOAD_COLORS[entry.name.toUpperCase()] || '#8B5CF6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
