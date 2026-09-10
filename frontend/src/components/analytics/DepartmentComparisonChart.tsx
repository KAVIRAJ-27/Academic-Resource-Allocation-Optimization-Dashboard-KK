import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { DepartmentMetrics } from '../../types/analytics';

interface DepartmentComparisonChartProps {
  departments: DepartmentMetrics[];
  title?: string;
}

export const DepartmentComparisonChart: React.FC<DepartmentComparisonChartProps> = ({
  departments = [],
  title = 'Department Metrics Comparison',
}) => {
  if (departments.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-center">
        <p className="text-xs text-slate-400">No department comparison data available.</p>
      </div>
    );
  }

  const chartData = departments.map((d) => ({
    name: d.departmentCode || d.departmentName,
    Allocations: d.allocationCount,
    Requests: d.requestCount,
    Resources: d.resourceCount,
  }));

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</h3>
      <div className="h-72 w-full">
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
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
            />
            <Bar dataKey="Allocations" fill="#14B8A6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Requests" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Resources" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
