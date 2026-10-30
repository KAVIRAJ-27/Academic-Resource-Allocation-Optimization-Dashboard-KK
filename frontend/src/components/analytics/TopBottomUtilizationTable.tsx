import React, { useState } from 'react';
import { RankedResource } from '../../types/analytics';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopBottomUtilizationTableProps {
  topResources: RankedResource[];
  bottomResources: RankedResource[];
}

export const TopBottomUtilizationTable: React.FC<TopBottomUtilizationTableProps> = ({
  topResources = [],
  bottomResources = [],
}) => {
  const [tab, setTab] = useState<'top' | 'bottom'>('top');
  const activeList = tab === 'top' ? topResources : bottomResources;

  return (
    <div className="rounded-2xl border border-[#D8C9A8] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#202020]">
          Resource Utilization Extremes
        </h3>
        <div className="flex rounded-xl border border-[#E8E0D0] bg-[#F8F6F0] p-0.5 text-xs">
          <button
            onClick={() => setTab('top')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
              tab === 'top'
                ? 'bg-white text-[#3F7655] shadow-xs border border-[#C1DFCD]'
                : 'text-[#555555] hover:text-[#202020]'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Top Utilized
          </button>
          <button
            onClick={() => setTab('bottom')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
              tab === 'bottom'
                ? 'bg-white text-[#B44747] shadow-xs border border-[#ECC6C6]'
                : 'text-[#555555] hover:text-[#202020]'
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            Least Utilized
          </button>
        </div>
      </div>

      {activeList.length === 0 ? (
        <div className="py-8 text-center text-xs font-medium text-[#77736A]">
          No resource ranking data available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E0D0] bg-[#F8F6F0] text-[#555555] font-serif font-bold">
                <th className="py-2.5 px-3 font-semibold">Resource</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Department</th>
                <th className="py-2.5 px-3 font-semibold">Allocations</th>
                <th className="py-2.5 px-3 font-semibold text-right">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E0D0]">
              {activeList.map((res) => (
                <tr key={res.resourceId} className="hover:bg-[#F4F0E6] transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#202020]">{res.resourceName}</td>
                  <td className="py-2.5 px-3 text-[#555555]">{res.categoryName || res.resourceType || 'General'}</td>
                  <td className="py-2.5 px-3 text-[#555555]">{res.departmentName || 'Campus Wide'}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#202020]">{res.totalAllocations ?? 0}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-right text-[#202020]">{res.utilizationPercentage ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
