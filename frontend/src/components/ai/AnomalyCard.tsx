import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { Anomaly } from '../../types/ai';

interface AnomalyCardProps {
  anomaly: Anomaly;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly }) => {
  return (
    <div className="bg-white border border-[#D8C9A8] rounded-xl p-5 hover:border-[#B8A16A] transition-all shadow-none">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-[#FBF0F0] border border-[#ECC0C0] text-[#B44747]">
            <Zap className="w-4 h-4 text-[#B44747]" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[#202020]">{anomaly.entity_name}</h4>
            <span className="text-[10px] text-[#77736A] font-bold uppercase tracking-wider font-mono">
              {anomaly.anomaly_type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FBF0F0] border border-[#ECC0C0] text-xs text-[#B44747] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 text-[#B44747]" />
          {anomaly.severity}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-3 p-2.5 bg-[#FBF9F3] rounded border border-[#E8E0D0]">
        <div>
          <span className="text-[10px] text-[#77736A] uppercase tracking-wide block font-medium">Observed Value</span>
          <span className="text-lg font-serif font-bold text-[#B44747]">{anomaly.observed_value}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#77736A] uppercase tracking-wide block font-medium">Expected Baseline</span>
          <span className="text-lg font-serif font-bold text-[#555555]">~{anomaly.expected_baseline}</span>
        </div>
      </div>

      <p className="text-xs text-[#555555] leading-relaxed mt-2">{anomaly.reason}</p>

      <div className="mt-3 pt-2 border-t border-[#E8E0D0] flex items-center justify-between text-[11px] text-[#77736A] font-mono">
        <span>Anomaly Score: <strong className="text-[#202020]">{anomaly.anomaly_score}</strong></span>
        <span className="text-[#B8A16A] font-semibold">Unsupervised IsolationForest</span>
      </div>
    </div>
  );
};
