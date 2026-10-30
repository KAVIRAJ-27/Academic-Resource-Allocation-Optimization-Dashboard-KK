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
    <div className="bg-white border border-[#D8C9A8] rounded-xl p-5 shadow-none hover:border-[#B8A16A] transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-[#FBF9F3] border border-[#E8E0D0] text-[#B8A16A]">
            <Icon className="w-4 h-4 text-[#B8A16A]" />
          </div>
          <span className="text-xs font-serif font-bold text-[#202020] tracking-wide uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F4F0E6] border border-[#D8C9A8] text-[10px] font-medium text-[#B8A16A]">
          <Sparkles className="w-3 h-3 text-[#B8A16A]" />
          <span>AI Forecast</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-2 pt-2 border-t border-[#E8E0D0]">
        <div>
          <span className="text-[10px] font-medium text-[#77736A] uppercase tracking-wider block mb-0.5">
            Actual
          </span>
          <span className="text-xl font-serif font-bold text-[#202020]">
            {actualValue}{unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-medium text-[#B8A16A] uppercase tracking-wider block mb-0.5">
            Predicted
          </span>
          <span className="text-xl font-serif font-bold text-[#B8A16A]">
            {predictedValue}{unit}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#E8E0D0] flex items-center justify-between text-xs">
        {changeLabel && (
          <span
            className={`font-medium ${
              changeType === 'positive'
                ? 'text-[#3F7655]'
                : changeType === 'negative'
                ? 'text-[#B44747]'
                : 'text-[#77736A]'
            }`}
          >
            {changeLabel}
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto text-[10px] text-[#77736A] font-mono">
          {confidence !== undefined && <span>Confidence: {confidence}%</span>}
          <span className="px-1.5 py-0.5 rounded bg-[#FBF9F3] border border-[#E8E0D0] text-[#77736A]">{modelVersion}</span>
        </div>
      </div>
    </div>
  );
};
