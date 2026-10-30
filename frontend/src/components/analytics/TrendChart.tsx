import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TimeSeriesPoint } from '../../types/analytics';

interface TrendChartProps {
  data: TimeSeriesPoint[];
  title?: string;
  dataKey?: string;
  lineColor?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data = [],
  title = 'Trends Over Time',
  dataKey = 'count',
  lineColor = '#B8A16A',
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#D8C9A8] bg-white p-6 text-center shadow-card">
        <p className="text-xs font-medium text-[#77736A]">No trend data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#D8C9A8] bg-white p-5 shadow-card">
      <h3 className="mb-4 text-xs font-serif font-bold uppercase tracking-wider text-[#202020]">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" vertical={false} />
            <XAxis dataKey="label" stroke="#77736A" fontSize={11} tickLine={false} />
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
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={lineColor}
              strokeWidth={3}
              dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
