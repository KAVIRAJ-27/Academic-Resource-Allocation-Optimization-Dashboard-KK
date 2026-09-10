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
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-center">
        <p className="text-xs text-slate-400">No hostel occupancy data available.</p>
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
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</h3>
      </div>
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
            <Bar dataKey="Occupied" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Available" stackId="a" fill="#64748B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
