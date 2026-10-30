import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface RequestStatusChartProps {
  statusData?: Record<string, number>;
  title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#3F7655',
  PENDING: '#A87928',
  REJECTED: '#B44747',
  CANCELLED: '#77736A',
  COMPLETED: '#B8A16A',
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
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#D8C9A8] bg-white p-6 text-center shadow-card">
        <p className="text-xs font-medium text-[#77736A]">No request data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#D8C9A8] bg-white p-5 shadow-card">
      <h3 className="mb-4 text-xs font-serif font-bold uppercase tracking-wider text-[#202020]">{title}</h3>
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
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#B8A16A'} />
              ))}
            </Pie>
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
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(val) => <span className="text-xs font-semibold text-[#555555]">{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
