import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Building,
  BedDouble,
  Sliders,
  Check,
} from 'lucide-react';
import { OptimizationRecommendation } from '../../types/optimization';
import { Badge, Button } from '../ui';

interface OptimizationRecommendationCardProps {
  recommendation: OptimizationRecommendation;
  isSelected?: boolean;
  onSelect: (rec: OptimizationRecommendation) => void;
  domain?: 'ACADEMIC' | 'HOSTEL';
}

export const OptimizationRecommendationCard: React.FC<OptimizationRecommendationCardProps> = ({
  recommendation,
  isSelected = false,
  onSelect,
  domain = 'ACADEMIC',
}) => {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const isTopMatch = recommendation.rank === 1;

  // Format factor labels nicely
  const formatFactorLabel = (factor: string) => {
    return factor
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'bg-[#F4F0E6]/95 border-[#B8A16A] shadow-gold-glow ring-2 ring-[#B8A16A]/25'
          : isTopMatch
          ? 'bg-white/85 backdrop-blur-md border-[#B8A16A] shadow-glass hover:shadow-glass-hover'
          : 'bg-white/80 backdrop-blur-md border-[#D8C9A8]/70 shadow-glass hover:border-[#B8A16A]'
      }`}
    >
      {/* Header bar */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Rank Badge */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
              isTopMatch
                ? 'bg-gradient-to-br from-[#FAF7F0] to-[#F4F0E6] text-[#A87928] border border-[#E8D8BA]'
                : recommendation.rank === 2
                ? 'bg-white/80 text-[#202020] border border-[#E8E0D0]'
                : 'bg-white/60 text-[#77736A] border border-[#E8E0D0]'
            }`}
          >
            #{recommendation.rank}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-serif font-bold text-[#202020] tracking-tight">
                {recommendation.candidateName}
              </h4>
              {isTopMatch && (
                <Badge variant="warning" className="flex items-center gap-1 text-[11px] py-0.5">
                  <Award className="w-3 h-3" /> Top Recommendation
                </Badge>
              )}
              {recommendation.candidateCode && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#F8F6F0] text-[#555555] border border-[#E8E0D0] font-mono">
                  {recommendation.candidateCode}
                </span>
              )}
            </div>

            {/* Subtitle details */}
            <p className="text-xs text-[#555555] mt-1 flex items-center gap-2 flex-wrap">
              {domain === 'ACADEMIC' ? (
                <>
                  <span className="flex items-center gap-1 text-[#555555] font-medium">
                    <Building className="w-3.5 h-3.5 text-[#B8A16A]" />
                    {recommendation.details?.building
                      ? `${recommendation.details.building} - ${recommendation.details.roomNumber || ''}`
                      : recommendation.details?.location || 'Campus'}
                  </span>
                  <span>&bull;</span>
                  <span>Capacity: <strong className="text-[#202020]">{recommendation.details?.capacity || 'N/A'}</strong> seats</span>
                  {recommendation.details?.wastedCapacity !== undefined && (
                    <span className="text-[#3F7655] font-medium">
                      (+{recommendation.details.wastedCapacity} spare)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1 text-[#555555] font-medium">
                    <BedDouble className="w-3.5 h-3.5 text-[#A87928]" />
                    {recommendation.details?.hostelName || 'Hostel'}
                  </span>
                  <span>&bull;</span>
                  <span>
                    {recommendation.details?.blockName || 'Block'} (Floor {recommendation.details?.floorNumber || 1})
                  </span>
                  <span>&bull;</span>
                  <span>
                    Room {recommendation.details?.roomNumber || ''} &bull; Bed #{recommendation.details?.bedNumber || ''}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Score & Select Button */}
        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#D8C9A8] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B8A16A]" />
            <span className="text-lg font-serif font-bold text-[#202020] tracking-tight">
              {recommendation.score}
            </span>
            <span className="text-[10px] text-[#77736A]">/ 100</span>
          </div>

          <Button
            size="sm"
            variant={isSelected ? 'primary' : isTopMatch ? 'primary' : 'outline'}
            onClick={() => onSelect(recommendation)}
            className="flex items-center gap-1.5 text-xs font-semibold shadow-xs"
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#202020]" /> Selected
              </>
            ) : (
              'Use Recommendation'
            )}
          </Button>
        </div>
      </div>

      {/* Rationale Bullet Points */}
      {recommendation.reasons && recommendation.reasons.length > 0 && (
        <div className="px-4 py-2.5 bg-[#EEF6F1]/80 backdrop-blur-xs border-t border-[#C1DFCD]">
          <div className="space-y-1">
            {recommendation.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#3F7655] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7655] flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainable Factor Breakdown Toggle */}
      <div className="px-4 py-2 bg-[#F8F6F0]/80 backdrop-blur-xs border-t border-[#E8E0D0]/80 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-[11px] font-semibold text-[#202020] hover:text-[#B8A16A] flex items-center gap-1.5 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-[#B8A16A]" />
          <span>{showBreakdown ? 'Hide Scoring Breakdown' : 'View Explainable Scoring Breakdown'}</span>
          {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <span className="text-[10px] text-[#77736A] font-mono">
          Deterministic 5-Factor Score
        </span>
      </div>

      {/* Factor Breakdown Panel */}
      {showBreakdown && recommendation.factors && (
        <div className="p-4 bg-[#FBF9F3]/90 backdrop-blur-xs border-t border-[#E8E0D0]/80 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendation.factors.map((factor, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white/80 border border-[#D8C9A8]/70 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#202020]">
                    {formatFactorLabel(factor.factor)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#77736A] font-mono">
                      Raw: {Math.round(factor.rawScore)}%
                    </span>
                    <span className="font-bold text-[#3F7655] bg-[#EEF6F1] border border-[#C1DFCD] px-1.5 py-0.5 rounded text-[11px]">
                      +{factor.weightedScore} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#F8F6F0] h-1.5 rounded-full overflow-hidden border border-[#E8E0D0]">
                  <div
                    className="bg-[#B8A16A] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, factor.rawScore)}%` }}
                  />
                </div>

                {factor.description && (
                  <p className="text-[10px] text-[#77736A] leading-snug">
                    {factor.description} (Weight: {factor.weight}%)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
