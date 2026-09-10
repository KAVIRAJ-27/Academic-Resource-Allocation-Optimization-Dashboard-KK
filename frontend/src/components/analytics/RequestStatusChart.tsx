import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface RequestStatusChartProps {
  statusData?: Record<string, number>;
  title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#10B981',
  PENDING: '#F59E0B',
  REJECTED: '#EF4444',
  CANCELLED: '#64748B',
  COMPLETED: '#3B82F6',
};

export const RequestStatusChart: React.FC<RequestStatusChartProps> = ({
  statusData = {},
  title = 'Request Status Breakdown',
}) => {
  const data = Object.entries(statusData).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-center">
        <p className="text-xs text-slate-400">No request data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#8B5CF6'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
