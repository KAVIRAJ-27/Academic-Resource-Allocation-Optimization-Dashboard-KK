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
  NORMAL: '#3F7655',
  BALANCED: '#3F7655',
  LOW: '#77736A',
  UNDERUTILIZED: '#77736A',
  HIGH: '#A87928',
  OVERLOADED: '#B44747',
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
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#D8C9A8] bg-white p-6 text-center shadow-card">
        <p className="text-xs font-medium text-[#77736A]">No faculty workload data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#D8C9A8] bg-white p-5 shadow-card">
      <h3 className="mb-4 text-xs font-serif font-bold uppercase tracking-wider text-[#202020]">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" vertical={false} />
            <XAxis dataKey="name" stroke="#77736A" fontSize={11} tickLine={false} />
            <YAxis stroke="#77736A" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#D8C9A8',
                borderRadius: '12px',
                boxShadow: '0 4px 10px -1px rgba(184, 161, 106, 0.15)',
                fontSize: '12px',
                color: '#202020',
                fontWeight: 600,
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={WORKLOAD_COLORS[entry.name.toUpperCase()] || '#B8A16A'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
