import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface AiMetricCardProps {
  title: string;
  actualValue: string | number;
  predictedValue: string | number;
  unit?: string;
  changeLabel?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  modelVersion?: string;
  icon: LucideIcon;
  iconColor?: string;
  confidence?: number;
}

export const AiMetricCard: React.FC<AiMetricCardProps> = ({
  title,
  actualValue,
  predictedValue,
  unit = '',
  changeLabel,
  changeType = 'neutral',
  modelVersion = 'v1.0',
  icon: Icon,
  iconColor = 'text-teal-400',
  confidence,
}) => {
  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 shadow-card hover:border-teal-500/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#171A23] border border-[#262B3B]">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-[10px] font-mono text-teal-300">
          <Sparkles className="w-3 h-3" />
          <span>AI Forecast</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-2 pt-1 border-t border-[#1E2330]">
        <div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
            Actual
          </span>
          <span className="text-xl font-bold text-gray-200 font-mono">
            {actualValue}{unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider block mb-0.5">
            Predicted
          </span>
          <span className="text-xl font-bold text-teal-300 font-mono">
            {predictedValue}{unit}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#1E2330]/60 flex items-center justify-between text-xs">
        {changeLabel && (
          <span
            className={`font-medium ${
              changeType === 'positive'
                ? 'text-emerald-400'
                : changeType === 'negative'
                ? 'text-rose-400'
                : 'text-gray-400'
            }`}
          >
            {changeLabel}
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto text-[10px] text-gray-400 font-mono">
          {confidence !== undefined && <span>Confidence: {confidence}%</span>}
          <span className="px-1.5 py-0.5 rounded bg-[#171A23] border border-[#262B3B]">{modelVersion}</span>
        </div>
      </div>
    </div>
  );
};
