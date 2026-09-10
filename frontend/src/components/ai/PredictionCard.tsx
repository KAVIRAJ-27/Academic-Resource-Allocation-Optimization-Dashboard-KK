import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';

interface PredictionCardProps {
  title: string;
  category: string;
  currentValue: number | string;
  predictedValue: number | string;
  unit?: string;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'stable';
  explanation: string;
  modelVersion?: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  title,
  category,
  currentValue,
  predictedValue,
  unit = '',
  deltaLabel,
  trend = 'stable',
  explanation,
  modelVersion,
}) => {
  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 hover:border-[#2A3142] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-teal-400 uppercase px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
            {category}
          </span>
          <h4 className="text-sm font-semibold text-gray-200 mt-2">{title}</h4>
        </div>
        {modelVersion && (
          <span className="text-[10px] font-mono text-gray-400 bg-[#171A23] px-2 py-0.5 rounded border border-[#262B3B]">
            {modelVersion}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between my-3 p-3 rounded-lg bg-[#0B0D14] border border-[#1E2330]">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide block">Current Baseline</span>
          <span className="text-lg font-bold text-gray-300 font-mono">
            {currentValue}{unit}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-teal-400 uppercase tracking-wide block">Projected</span>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-xl font-black text-teal-300 font-mono">
              {predictedValue}{unit}
            </span>
            {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
            {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-rose-400" />}
            {trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </div>

      {deltaLabel && (
        <div className="text-xs font-medium text-gray-300 mb-2">
          Trend Delta: <span className="font-mono text-teal-300">{deltaLabel}</span>
        </div>
      )}

      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-[#1E2330] text-xs text-gray-400 leading-relaxed">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p>{explanation}</p>
      </div>
    </div>
  );
};
