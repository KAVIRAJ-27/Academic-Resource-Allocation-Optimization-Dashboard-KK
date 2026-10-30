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

const PALETTE = ['#B8A16A', '#3F7655', '#657C91', '#A87928', '#77736A', '#D8C9A8'];

export const HodStudentDistributionChart: React.FC<HodStudentDistributionChartProps> = ({
  distribution,
}) => {
  const totalStudents = distribution.reduce((sum, item) => sum + item.studentCount, 0);

  if (!distribution || distribution.length === 0) {
    return (
      <Card className="p-6 border border-[#E8E0D0] bg-white rounded-xl flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-12 h-12 rounded bg-[#FBF9F3] border border-[#E8E0D0] flex items-center justify-center text-[#77736A] mb-3">
          <GraduationCap className="w-6 h-6 text-[#B8A16A]" />
        </div>
        <h4 className="text-sm font-serif font-bold text-[#202020]">No Student Enrollment Data</h4>
        <p className="text-xs text-[#77736A] mt-1 max-w-sm">
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
        <div className="bg-white border border-[#D8C9A8] p-3 rounded shadow-md text-xs space-y-1">
          <p className="font-serif font-bold text-[#202020]">{data.fullName}</p>
          <p className="text-[#555555]">
            Degree: <span className="text-[#B8A16A] font-medium">{data.degreeType}</span>
          </p>
          <p className="text-[#555555]">
            Enrolled: <span className="text-[#3F7655] font-serif font-bold">{data.count} students</span> ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border border-[#D8C9A8] bg-white shadow-none rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FBF9F3] text-[#B8A16A] border border-[#E8E0D0]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#202020]">Student Enrollment by Program</h3>
              <p className="text-xs text-[#77736A]">Department cohort distribution</p>
            </div>
          </div>
          <Badge variant="neutral" size="md">
            {totalStudents} Enrolled
          </Badge>
        </div>

        {/* Recharts Visualization */}
        <div className="h-52 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#77736A', fontSize: 11 }}
                axisLine={{ stroke: '#E8E0D0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#77736A', fontSize: 11 }}
                axisLine={{ stroke: '#E8E0D0' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
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
      <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-2">
        {distribution.map((item, idx) => (
          <div
            key={item.programId || idx}
            className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
              />
              <span className="font-medium text-[#111827] truncate">{item.programName}</span>
              <span className="text-[#64748B] font-mono">({item.programCode})</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[#64748B]">{item.studentCount} students</span>
              <span className="font-semibold text-[#111827] w-10 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
