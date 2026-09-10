import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { Anomaly } from '../../types/ai';

interface AnomalyCardProps {
  anomaly: Anomaly;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly }) => {
  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 hover:border-rose-500/30 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-200">{anomaly.entity_name}</h4>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
              {anomaly.anomaly_type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          {anomaly.severity}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-3 p-2.5 bg-[#0B0D14] rounded-lg border border-[#1E2330]">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide block">Observed Value</span>
          <span className="text-lg font-bold text-rose-400 font-mono">{anomaly.observed_value}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide block">Expected Baseline</span>
          <span className="text-lg font-bold text-gray-300 font-mono">~{anomaly.expected_baseline}</span>
        </div>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed mt-2">{anomaly.reason}</p>

      <div className="mt-3 pt-2 border-t border-[#1E2330] flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <span>Anomaly Score: {anomaly.anomaly_score}</span>
        <span className="text-teal-400">Unsupervised IsolationForest</span>
      </div>
    </div>
  );
};
