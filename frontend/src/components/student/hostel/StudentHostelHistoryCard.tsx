import React from 'react';
import { Card } from '../../ui';
import { StudentHostelAllocationHistory } from '../../../types/studentHostel';
import { History, Calendar, CheckCircle2, Ban } from 'lucide-react';

interface Props {
  history: StudentHostelAllocationHistory[];
}

export const StudentHostelHistoryCard: React.FC<Props> = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <Card className="p-5 bg-[#11141C] border-[#1E2330] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Hostel Allocation Records & History
            </h3>
            <p className="text-xs text-gray-400">
              Audit log of past and active residential tenure periods
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#171A23] text-gray-400 border border-[#222838]">
          {history.length} Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1E2330] text-[11px] font-semibold text-gray-400 uppercase font-mono bg-[#171A23]/40">
              <th className="py-2.5 px-3">Tenure / Term</th>
              <th className="py-2.5 px-3">Hostel & Block</th>
              <th className="py-2.5 px-3">Room & Bed</th>
              <th className="py-2.5 px-3">Dates</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2330]">
            {history.map((record) => {
              const isActive = record.status === 'ACTIVE';

              return (
                <tr key={record.id} className="hover:bg-[#171A23]/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-white">
                    {record.academicYearName || 'Academic Session'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-white">{record.hostelName || 'Hostel'}</div>
                    <div className="text-[11px] text-gray-400">{record.blockName || 'Block'}</div>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="text-white font-medium">Room {record.roomNumber || '—'}</span>
                    <span className="text-gray-400"> • Bed {record.bedNumber || '—'}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-gray-300">
                    <div>{record.startDate || '—'}</div>
                    <div className="text-gray-500">to {record.endDate || 'Ongoing'}</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">
                        {record.status}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
