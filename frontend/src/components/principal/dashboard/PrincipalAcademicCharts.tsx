import React from 'react';
import {
  PrincipalStudentOverviewDto,
  PrincipalResourceOverviewDto,
  PrincipalRequestOverviewDto,
} from '../../../types/principal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui';
import { GraduationCap, Cpu, FileText } from 'lucide-react';

interface PrincipalAcademicChartsProps {
  students: PrincipalStudentOverviewDto;
  resources: PrincipalResourceOverviewDto;
  requests: PrincipalRequestOverviewDto;
}

const RESOURCE_COLORS = {
  Available: '#3F7655',   // Sage Green
  Allocated: '#B8A16A',   // Champagne Gold
  Maintenance: '#A87928', // Amber
  Inactive: '#77736A',    // Muted Charcoal
};

export const PrincipalAcademicCharts: React.FC<PrincipalAcademicChartsProps> = ({
  students,
  resources,
  requests,
}) => {
  // 1. Students by Department
  const studentData = (students.byDepartment || []).map((d) => ({
    name: d.departmentCode || d.departmentName,
    fullName: d.departmentName,
    students: d.studentCount,
  }));
  const hasStudentData = studentData.some((d) => d.students > 0);

  // 2. Resource Status Distribution
  const resourceData = [
    { name: 'Available', value: resources.availableResources, color: RESOURCE_COLORS.Available },
    { name: 'Allocated', value: resources.allocatedResources, color: RESOURCE_COLORS.Allocated },
    { name: 'Maintenance', value: resources.maintenanceResources, color: RESOURCE_COLORS.Maintenance },
    { name: 'Inactive', value: resources.inactiveResources, color: RESOURCE_COLORS.Inactive },
  ].filter((item) => item.value > 0);
  const hasResourceData = resourceData.length > 0;

  // 3. Request Status Breakdown
  const requestData = [
    { name: 'Pending', count: requests.pendingRequests, fill: '#A87928' },
    { name: 'Approved', count: requests.approvedRequests, fill: '#3F7655' },
    { name: 'Rejected', count: requests.rejectedRequests, fill: '#B44747' },
    { name: 'Cancelled', count: requests.cancelledRequests, fill: '#77736A' },
    { name: 'Completed', count: requests.completedRequests, fill: '#657C91' },
  ];
  const hasRequestData = requestData.some((d) => d.count > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Chart 1: Students by Department */}
      <Card className="flex flex-col border-[#D8C9A8] bg-white shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#B8A16A]" />
            <CardTitle className="text-base font-serif font-bold text-[#202020]">Students by Department</CardTitle>
          </div>
          <CardDescription className="text-xs text-[#77736A]">Live student population distribution</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center min-h-[260px]">
          {hasStudentData ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#555555' }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#555555' }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value} Students`, 'Total']}
                    labelFormatter={(label: any) => {
                      const found = studentData.find((d) => d.name === label);
                      return found ? found.fullName : label;
                    }}
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D8C9A8', borderRadius: '4px', color: '#202020', fontSize: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar dataKey="students" fill="#B8A16A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-[#77736A] text-sm">
              No student distribution data available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart 2: Resource Status Distribution */}
      <Card className="flex flex-col border-[#D8C9A8] bg-white shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#3F7655]" />
            <CardTitle className="text-base font-serif font-bold text-[#202020]">Resource Status Distribution</CardTitle>
          </div>
          <CardDescription className="text-xs text-[#77736A]">Real-time physical asset operational status</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center min-h-[260px]">
          {hasResourceData ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {resourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} Resources`, 'Count']}
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D8C9A8', borderRadius: '4px', color: '#202020', fontSize: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#555555' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-[#77736A] text-sm">
              No academic resource data available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart 3: Resource Request Breakdown */}
      <Card className="flex flex-col border-[#D8C9A8] bg-white shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#A87928]" />
            <CardTitle className="text-base font-serif font-bold text-[#202020]">Resource Requests Breakdown</CardTitle>
          </div>
          <CardDescription className="text-xs text-[#77736A]">Status of institution-wide resource requisitions</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center min-h-[260px]">
          {hasRequestData ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#555555' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#555555' }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value} Requests`, 'Count']}
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D8C9A8', borderRadius: '4px', color: '#202020', fontSize: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {requestData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-[#77736A] text-sm">
              No resource request data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
