import React from 'react';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';
import { Bottleneck } from '../../types/ai';

interface BottleneckItemProps {
  bottleneck: Bottleneck;
}

export const BottleneckItem: React.FC<BottleneckItemProps> = ({ bottleneck }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 hover:border-[#2A3142] transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#171A23] border border-[#262B3B]">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-200">{bottleneck.entity_name}</h4>
            <span className="text-[10px] text-gray-400 font-mono uppercase">{bottleneck.category} Domain</span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityStyle(bottleneck.severity)}`}>
          {bottleneck.severity} SEVERITY
        </span>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed my-3 bg-[#0B0D14] p-3 rounded-lg border border-[#1E2330]">
        {bottleneck.explanation}
      </p>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        {bottleneck.conflict_count > 0 && (
          <div>
            Historical Conflicts: <span className="font-mono text-rose-400 font-bold">{bottleneck.conflict_count}</span>
          </div>
        )}
        {bottleneck.utilization_pct > 0 && (
          <div>
            Current Load: <span className="font-mono text-teal-300 font-bold">{bottleneck.utilization_pct}%</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#1E2330] flex items-start gap-2 text-xs">
        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="text-teal-300/90 font-medium">
          <span className="text-gray-400">Action Plan:</span> {bottleneck.recommended_action}
        </p>
      </div>
    </div>
  );
};
