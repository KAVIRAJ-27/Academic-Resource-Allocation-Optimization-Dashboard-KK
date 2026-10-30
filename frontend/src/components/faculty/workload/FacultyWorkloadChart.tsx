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
import { FacultyWorkloadBreakdownItem } from '../../../types/faculty';
import { BarChart2 } from 'lucide-react';

interface FacultyWorkloadChartProps {
  breakdown: FacultyWorkloadBreakdownItem[];
}

const BAR_COLORS = ['#14B8A6', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

export const FacultyWorkloadChart: React.FC<FacultyWorkloadChartProps> = ({ breakdown }) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-card flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-800/60 flex items-center justify-center text-gray-500 mb-3">
          <BarChart2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-gray-300">No Teaching Hours Data</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Workload chart will visualize weekly teaching hours distribution once course assignments are recorded.
        </p>
      </div>
    );
  }

  const chartData = breakdown.map((item) => ({
    name: item.subjectCode || item.subjectName,
    fullName: item.subjectName,
    hours: item.hours || 0,
    section: item.sectionName || 'N/A',
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1A1E29] border border-[#2A3040] p-3 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-white">{data.fullName}</p>
          <p className="text-gray-400 mt-1">Code: <span className="text-teal-400 font-medium">{data.name}</span></p>
          <p className="text-gray-400">Section: <span className="text-gray-300 font-medium">{data.section}</span></p>
          <p className="text-gray-400">Weekly Hours: <span className="text-white font-bold">{data.hours} hrs</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Subject-wise Weekly Instruction Load</h3>
          <p className="text-xs text-gray-400 mt-0.5">Assigned weekly contact hours per subject</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2330" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1E2330' }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1E2330' }}
              allowDecimals={false}
              unit="h"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
