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
  ACTIVE: '#10B981',
  COMPLETED: '#3B82F6',
  CANCELLED: '#EF4444',
  PENDING: '#F59E0B',
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
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-center">
        <p className="text-xs text-slate-400">No allocation data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</h3>
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
                    fill={STATUS_COLORS[entry.name] || '#8B5CF6'}
                  />
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
          ) : (
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Bar dataKey="allocations" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
