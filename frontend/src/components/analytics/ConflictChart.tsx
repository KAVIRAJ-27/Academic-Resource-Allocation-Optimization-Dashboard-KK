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
import { ConflictAnalytics } from '../../types/analytics';

interface ConflictChartProps {
  conflicts: ConflictAnalytics;
  title?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#B44747',
  HIGH: '#A87928',
  MEDIUM: '#B8A16A',
  LOW: '#657C91',
};

export const ConflictChart: React.FC<ConflictChartProps> = ({
  conflicts,
  title = 'Detected Conflict Breakdown by Severity',
}) => {
  const chartData = [
    { name: 'Critical', count: conflicts.criticalConflicts, color: SEVERITY_COLORS.CRITICAL },
    { name: 'High', count: conflicts.highConflicts, color: SEVERITY_COLORS.HIGH },
    { name: 'Medium', count: conflicts.mediumConflicts, color: SEVERITY_COLORS.MEDIUM },
    { name: 'Low', count: conflicts.lowConflicts, color: SEVERITY_COLORS.LOW },
  ].filter((c) => c.count > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#D8C9A8] bg-white p-6 text-center shadow-card">
        <p className="text-xs font-medium text-[#77736A]">No conflicts detected in the system.</p>
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
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
