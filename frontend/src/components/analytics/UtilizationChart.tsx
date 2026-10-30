import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TimeSeriesPoint } from '../../types/analytics';

interface UtilizationChartProps {
  trends?: TimeSeriesPoint[];
  categoryData?: Record<string, number>;
  title?: string;
  type?: 'area' | 'bar';
}

export const UtilizationChart: React.FC<UtilizationChartProps> = ({
  trends = [],
  categoryData = {},
  title = 'Resource Utilization Trends',
  type = 'area',
}) => {
  const chartData =
    type === 'area'
      ? trends.map((t) => ({ name: t.label, value: t.value || t.count }))
      : Object.entries(categoryData).map(([cat, count]) => ({ name: cat, value: count }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#D8C9A8] bg-white p-6 text-center shadow-card">
        <p className="text-xs font-medium text-[#77736A]">No utilization data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#D8C9A8] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#202020]">{title}</h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B8A16A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#B8A16A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
              <Area type="monotone" dataKey="value" stroke="#B8A16A" strokeWidth={2.5} fillOpacity={1} fill="url(#utilGrad)" />
            </AreaChart>
          ) : (
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
              <Bar dataKey="value" fill="#B8A16A" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
