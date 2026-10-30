import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface AllocationChartProps {
  statusData?: Record<string, number>;
  departmentData?: Record<string, number>;
  title?: string;
  type?: 'pie' | 'bar';
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#3F7655',
  COMPLETED: '#B8A16A',
  CANCELLED: '#B44747',
  PENDING: '#A87928',
};

export const AllocationChart: React.FC<AllocationChartProps> = ({
  statusData = {},
  departmentData = {},
  title = 'Allocation Distribution',
  type = 'pie',
}) => {
  const pieData = Object.entries(statusData).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  const barData = Object.entries(departmentData).map(([dept, count]) => ({
    name: dept,
    allocations: count,
  }));

  if ((type === 'pie' && pieData.length === 0) || (type === 'bar' && barData.length === 0)) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#D8C9A8] bg-white p-6 text-center shadow-card">
        <p className="text-xs font-medium text-[#77736A]">No allocation data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#D8C9A8] bg-white p-5 shadow-card">
      <h3 className="mb-4 text-xs font-serif font-bold uppercase tracking-wider text-[#202020]">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.name] || '#B8A16A'}
                  />
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
          ) : (
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Bar dataKey="allocations" fill="#B8A16A" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
