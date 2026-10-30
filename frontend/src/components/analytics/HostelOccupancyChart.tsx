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
import { HostelOccupancyItem } from '../../types/analytics';

interface HostelOccupancyChartProps {
  hostels: HostelOccupancyItem[];
  title?: string;
}

export const HostelOccupancyChart: React.FC<HostelOccupancyChartProps> = ({
  hostels = [],
  title = 'Hostel Occupancy & Bed Distribution',
}) => {
  if (hostels.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#D8C9A8] bg-white p-6 text-center shadow-card">
        <p className="text-xs font-medium text-[#77736A]">No hostel occupancy data available.</p>
      </div>
    );
  }

  const chartData = hostels.map((h) => ({
    name: h.hostelName,
    Occupied: h.occupiedBeds,
    Available: h.availableBeds,
    OccupancyRate: h.occupancyPercentage,
  }));

  return (
    <div className="rounded-2xl border border-[#D8C9A8] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#202020]">{title}</h3>
      </div>
      <div className="h-72 w-full">
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
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(val) => <span className="text-xs font-semibold text-[#555555]">{val}</span>}
            />
            <Bar dataKey="Occupied" stackId="a" fill="#B8A16A" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Available" stackId="a" fill="#3F7655" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
