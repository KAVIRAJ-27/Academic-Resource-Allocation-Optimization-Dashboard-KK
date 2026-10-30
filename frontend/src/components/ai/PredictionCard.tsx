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
    <div className="bg-white border border-[#D8C9A8] rounded-xl p-5 hover:border-[#B8A16A] transition-all shadow-none">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[#B8A16A] uppercase px-2 py-0.5 rounded bg-[#F4F0E6] border border-[#D8C9A8]">
            {category}
          </span>
          <h4 className="text-sm font-serif font-bold text-[#202020] mt-2">{title}</h4>
        </div>
        {modelVersion && (
          <span className="text-[10px] font-mono text-[#77736A] bg-[#FBF9F3] px-2 py-0.5 rounded border border-[#E8E0D0]">
            {modelVersion}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between my-3 p-3 rounded bg-[#FBF9F3] border border-[#E8E0D0]">
        <div>
          <span className="text-[10px] text-[#77736A] uppercase tracking-wide block font-medium">Current Baseline</span>
          <span className="text-lg font-serif font-bold text-[#202020]">
            {currentValue}{unit}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#B8A16A] uppercase tracking-wide block font-medium">Projected</span>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-xl font-serif font-bold text-[#B8A16A]">
              {predictedValue}{unit}
            </span>
            {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-[#3F7655]" />}
            {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-[#B44747]" />}
            {trend === 'stable' && <Minus className="w-4 h-4 text-[#77736A]" />}
          </div>
        </div>
      </div>

      {deltaLabel && (
        <div className="text-xs font-medium text-[#555555] mb-2">
          Trend Delta: <span className="font-mono text-[#B8A16A] font-semibold">{deltaLabel}</span>
        </div>
      )}

      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-[#E8E0D0] text-xs text-[#77736A] leading-relaxed">
        <Info className="w-4 h-4 text-[#B8A16A] shrink-0 mt-0.5" />
        <p>{explanation}</p>
      </div>
    </div>
  );
};
