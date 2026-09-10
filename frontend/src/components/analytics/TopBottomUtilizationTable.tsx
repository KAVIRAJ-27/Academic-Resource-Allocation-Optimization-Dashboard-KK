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
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Resource Utilization Extremes
        </h3>
        <div className="flex rounded-xl border border-slate-700 bg-slate-800/60 p-0.5 text-xs">
          <button
            onClick={() => setTab('top')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition ${
              tab === 'top'
                ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Top Utilized
          </button>
          <button
            onClick={() => setTab('bottom')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition ${
              tab === 'bottom'
                ? 'bg-rose-500/20 text-rose-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            Least Utilized
          </button>
        </div>
      </div>

      {activeList.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No resource ranking data available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 font-medium">Resource</th>
                <th className="pb-2.5 font-medium">Category</th>
                <th className="pb-2.5 font-medium">Department</th>
                <th className="pb-2.5 font-medium text-right">Capacity</th>
                <th className="pb-2.5 font-medium text-right">Allocations</th>
                <th className="pb-2.5 font-medium text-right">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {activeList.map((r, idx) => (
                <tr key={r.resourceId || idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5">
                    <span className="font-semibold text-white">{r.resourceName}</span>
                    <span className="ml-1.5 font-mono text-[10px] text-slate-400">
                      ({r.resourceCode})
                    </span>
                  </td>
                  <td className="py-2.5">{r.categoryName}</td>
                  <td className="py-2.5 text-slate-400">{r.departmentName}</td>
                  <td className="py-2.5 text-right font-mono">{r.capacity}</td>
                  <td className="py-2.5 text-right font-mono">{r.totalAllocations}</td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full ${
                            tab === 'top' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                          style={{ width: `${Math.min(100, r.utilizationPercentage)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-200">
                        {r.utilizationPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
