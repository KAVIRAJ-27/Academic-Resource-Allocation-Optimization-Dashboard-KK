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
        return 'bg-[#FBF0F0] text-[#B44747] border-[#ECC0C0]';
      case 'HIGH':
        return 'bg-[#FAF7F0] text-[#A87928] border-[#E8DEC8]';
      case 'MEDIUM':
        return 'bg-[#EFF3F6] text-[#657C91] border-[#C2D1DD]';
      default:
        return 'bg-[#FBF9F3] text-[#77736A] border-[#E8E0D0]';
    }
  };

  return (
    <div className="bg-white border border-[#D8C9A8] rounded-xl p-5 hover:border-[#B8A16A] transition-all shadow-none">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#FBF0F0] border border-[#ECC0C0] text-[#B44747]">
            <AlertOctagon className="w-4 h-4 text-[#B44747]" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[#202020]">{bottleneck.entity_name}</h4>
            <span className="text-[10px] text-[#77736A] font-mono uppercase">{bottleneck.category} Domain</span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityStyle(bottleneck.severity)}`}>
          {bottleneck.severity} SEVERITY
        </span>
      </div>

      <p className="text-xs text-[#202020] leading-relaxed my-3 bg-[#FBF9F3] p-3 rounded border border-[#E8E0D0]">
        {bottleneck.explanation}
      </p>

      <div className="flex items-center gap-4 text-xs text-[#77736A] mb-3">
        {bottleneck.conflict_count > 0 && (
          <div>
            Historical Conflicts: <span className="font-mono text-[#B44747] font-bold">{bottleneck.conflict_count}</span>
          </div>
        )}
        {bottleneck.utilization_pct > 0 && (
          <div>
            Current Load: <span className="font-mono text-[#B8A16A] font-bold">{bottleneck.utilization_pct}%</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#E8E0D0] flex items-start gap-2 text-xs">
        <CheckCircle2 className="w-4 h-4 text-[#3F7655] shrink-0 mt-0.5" />
        <p className="text-[#3F7655] font-medium">
          <span className="text-[#77736A] font-normal">Action Plan:</span> {bottleneck.recommended_action}
        </p>
      </div>
    </div>
  );
};
