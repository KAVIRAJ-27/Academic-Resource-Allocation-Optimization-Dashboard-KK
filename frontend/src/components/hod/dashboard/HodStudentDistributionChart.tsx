import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { HodStudentProgramDistribution } from '../../../types/hod';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { GraduationCap, BarChart2 } from 'lucide-react';

interface HodStudentDistributionChartProps {
  distribution: HodStudentProgramDistribution[];
}

const PALETTE = ['#8B5CF6', '#14B8A6', '#3B82F6', '#F59E0B', '#EC4899', '#06B6D4'];

export const HodStudentDistributionChart: React.FC<HodStudentDistributionChartProps> = ({
  distribution,
}) => {
  const totalStudents = distribution.reduce((sum, item) => sum + item.studentCount, 0);

  if (!distribution || distribution.length === 0) {
    return (
      <Card className="p-6 border border-gray-800 bg-gray-900/40 rounded-2xl flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-12 h-12 rounded-xl bg-gray-800/60 flex items-center justify-center text-gray-500 mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-gray-300">No Student Enrollment Data</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          No active student cohort enrollments were found for programs under this department.
        </p>
      </Card>
    );
  }

  const chartData = distribution.map((item) => ({
    name: item.programCode || item.programName,
    fullName: item.programName,
    degreeType: item.degreeType,
    count: item.studentCount,
    percentage: item.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1A1E29] border border-[#2A3040] p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-semibold text-white">{data.fullName}</p>
          <p className="text-gray-400">
            Degree: <span className="text-purple-300">{data.degreeType}</span>
          </p>
          <p className="text-gray-400">
            Enrolled: <span className="text-teal-400 font-bold">{data.count} students</span> ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border border-gray-800 bg-gray-900/40 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Student Enrollment by Program</h3>
              <p className="text-xs text-gray-400">Department cohort distribution</p>
            </div>
          </div>
          <Badge variant="purple" size="md">
            {totalStudents} Enrolled
          </Badge>
        </div>

        {/* Recharts Visualization */}
        <div className="h-52 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Program Breakdown List */}
      <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-2">
        {distribution.map((item, idx) => (
          <div
            key={item.programId || idx}
            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-gray-800/40 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
              />
              <span className="font-medium text-gray-200 truncate">{item.programName}</span>
              <span className="text-gray-400 font-mono">({item.programCode})</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-gray-400">{item.studentCount} students</span>
              <span className="font-semibold text-white w-10 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
